#!/usr/bin/env node
// CRO Platform — zero-dependency Node.js server (Node 18+).
// REST API + tracking/snippet endpoints + static dashboard.
//
//   node server.js            # start on http://localhost:4600
//   PORT=5000 node server.js  # custom port
//   DATA_FILE=... node server.js  # custom data file
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { Store } = require('./lib/store');
const { analyzeHtml, runAudit } = require('./lib/audit');
const recommendations = require('./lib/recommendations');
const {
  channelReport, funnelReport, DEFAULT_FUNNEL,
  validateFunnel, normalizeFunnel, filterEventsBySource,
} = require('./lib/attribution');
const { generateInsights } = require('./lib/insights');
const segments = require('./lib/segments');
const personalization = require('./lib/personalization');
const auth = require('./lib/auth');
const ga4 = require('./lib/ga4');
const perf = require('./lib/performance');
const {
  validateExperiment,
  normalizeExperiment,
  computeResults,
  VALID_STATUSES,
} = require('./lib/experiments');

const PORT = Number(process.env.PORT) || 4600;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const store = new Store(DATA_FILE);
const SESSION_SECRET = auth.loadSecret(DATA_FILE);
// Optional invite gate: set SIGNUP_CODE to require a code at signup.
const SIGNUP_CODE = process.env.SIGNUP_CODE || null;

// ---------------------------------------------------------------- helpers

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
  });
  res.end(payload);
}

function readBody(req, limit = 1024 * 256) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

// Minimal router: exact segments or :params.
const routes = [];
function route(method, pattern, handler) {
  routes.push({ method, segments: pattern.split('/').filter(Boolean), handler });
}
function matchRoute(method, pathname) {
  const parts = pathname.split('/').filter(Boolean);
  for (const r of routes) {
    if (r.method !== method || r.segments.length !== parts.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      const seg = r.segments[i];
      if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(parts[i]);
      else if (seg !== parts[i]) { ok = false; break; }
    }
    if (ok) return { handler: r.handler, params };
  }
  return null;
}

// ---------------------------------------------------------------- API: auth

route('GET', '/api/health', (req, res) => json(res, 200, { ok: true, now: new Date().toISOString() }));

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt };
}

route('POST', '/api/auth/signup', async (req, res) => {
  const body = await readBody(req);
  if (!auth.validEmail(body.email)) return json(res, 400, { error: 'valid email is required' });
  if (!body.password || String(body.password).length < 8) {
    return json(res, 400, { error: 'password must be at least 8 characters' });
  }
  if (SIGNUP_CODE && body.inviteCode !== SIGNUP_CODE) {
    return json(res, 403, { error: 'invalid invite code' });
  }
  const email = String(body.email).toLowerCase().trim();
  if (store.find('users', (u) => u.email === email).length) {
    return json(res, 409, { error: 'an account with this email already exists' });
  }
  const user = store.insert('users', {
    email,
    name: body.name ? String(body.name).trim() : email.split('@')[0],
    passwordHash: auth.hashPassword(body.password),
  });
  res.setHeader('set-cookie', auth.sessionCookie(auth.createSession(user.id, SESSION_SECRET)));
  json(res, 201, { user: publicUser(user) });
});

route('POST', '/api/auth/login', async (req, res) => {
  const body = await readBody(req);
  const email = String(body.email || '').toLowerCase().trim();
  const user = store.find('users', (u) => u.email === email)[0];
  if (!user || !auth.verifyPassword(body.password || '', user.passwordHash)) {
    return json(res, 401, { error: 'invalid email or password' });
  }
  res.setHeader('set-cookie', auth.sessionCookie(auth.createSession(user.id, SESSION_SECRET)));
  json(res, 200, { user: publicUser(user) });
});

route('POST', '/api/auth/logout', (req, res) => {
  res.setHeader('set-cookie', auth.clearCookie());
  json(res, 200, { ok: true });
});

route('GET', '/api/auth/me', (req, res) => {
  json(res, 200, { user: publicUser(req.user) });
});

// ---------------------------------------------------------------- API: sites

// Public view of a site: GA4 credentials are reduced to connection info.
function siteView(s) {
  const { ga4: conn, ...rest } = s;
  return {
    ...rest,
    ga4: conn ? { connected: true, propertyId: conn.propertyId, clientEmail: conn.clientEmail } : { connected: false },
  };
}

route('GET', '/api/sites', (req, res) => {
  const sites = store.all('sites').map((s) => ({
    ...siteView(s),
    experimentCount: store.find('experiments', (e) => e.siteId === s.id).length,
    auditCount: store.find('audits', (a) => a.siteId === s.id).length,
  }));
  json(res, 200, sites);
});

route('POST', '/api/sites', async (req, res) => {
  const body = await readBody(req);
  if (!body.name) return json(res, 400, { error: 'name is required' });
  const site = store.insert('sites', {
    name: String(body.name).trim(),
    url: body.url ? String(body.url).trim() : '',
    platform: body.platform || 'custom', // shopify | woocommerce | custom …
    ownerId: req.user ? req.user.id : null,
  });
  json(res, 201, site);
});

route('GET', '/api/sites/:id', (req, res, params) => {
  const site = store.get('sites', params.id);
  if (!site) return json(res, 404, { error: 'site not found' });
  json(res, 200, siteView(site));
});

route('DELETE', '/api/sites/:id', (req, res, params) => {
  if (!store.remove('sites', params.id)) return json(res, 404, { error: 'site not found' });
  json(res, 200, { ok: true });
});

// Activation status: is the snippet actually live on the user's website,
// and which capabilities are receiving data? Powers the setup checklist.
route('GET', '/api/sites/:id/status', (req, res, params) => {
  const site = store.get('sites', params.id);
  if (!site) return json(res, 404, { error: 'site not found' });
  const events = store.find('events', (e) => e.siteId === site.id);
  const now = Date.now();
  const last24h = events.filter((e) => now - Date.parse(e.createdAt) < 86400e3);
  const lastEvent = events[events.length - 1];
  const has = (fn) => events.some(fn);
  const checklist = {
    snippetInstalled: events.length > 0,
    receivingTraffic: last24h.length > 0,
    attributionSeen: has((e) => (e.lt && e.lt.source) || (e.ft && e.ft.source)),
    funnelStepTracked: has((e) => e.type === 'track'),
    conversionTracked: has((e) => e.type === 'conversion'),
    revenueTracked: has((e) => e.type === 'conversion' && typeof e.value === 'number'),
    vitalsCollected: has((e) => e.type === 'vital'),
    campaignAdded: store.find('campaigns', (c) => !c.siteId || c.siteId === site.id).length > 0,
    experimentRunning: store.find('experiments', (e) => e.siteId === site.id && e.status === 'running').length > 0,
    ga4Connected: !!site.ga4,
  };
  json(res, 200, {
    siteId: site.id,
    installed: checklist.snippetInstalled,
    lastEventAt: lastEvent ? lastEvent.createdAt : null,
    eventsLast24h: last24h.length,
    totalEvents: events.length,
    checklist,
    completed: Object.values(checklist).filter(Boolean).length,
    total: Object.keys(checklist).length,
  });
});

// ---------------------------------------------------------------- API: GA4 connection & reports

route('POST', '/api/sites/:id/ga4', async (req, res, params) => {
  const site = store.get('sites', params.id);
  if (!site) return json(res, 404, { error: 'site not found' });
  const body = await readBody(req, 1024 * 64);
  let conn;
  try {
    conn = ga4.parseConnection(body);
  } catch (err) {
    return json(res, 400, { error: err.message });
  }
  // Verify credentials + property access with a minimal live query.
  try {
    await ga4.report(conn, { type: 'overview', days: 7 });
  } catch (err) {
    return json(res, 502, { error: `connection test failed: ${err.message}` });
  }
  store.update('sites', site.id, { ga4: conn });
  json(res, 200, { ok: true, propertyId: conn.propertyId, clientEmail: conn.clientEmail });
});

route('DELETE', '/api/sites/:id/ga4', (req, res, params) => {
  const site = store.get('sites', params.id);
  if (!site) return json(res, 404, { error: 'site not found' });
  store.update('sites', site.id, { ga4: null });
  json(res, 200, { ok: true });
});

function requireGa4(res, params) {
  const site = store.get('sites', params.siteId);
  if (!site) { json(res, 404, { error: 'site not found' }); return null; }
  if (!site.ga4) { json(res, 400, { error: 'GA4 is not connected for this site — POST /api/sites/:id/ga4 first' }); return null; }
  return site;
}

// Canned or custom GA4 report: ?type=overview|channels|pages|trend&days=28
// or ?dimensions=a,b&metrics=x,y for the report builder.
route('GET', '/api/ga4/:siteId/report', async (req, res, params, query) => {
  const site = requireGa4(res, params);
  if (!site) return;
  try {
    const result = await ga4.report(site.ga4, {
      type: query.get('type') || undefined,
      dimensions: query.get('dimensions') ? query.get('dimensions').split(',') : undefined,
      metrics: query.get('metrics') ? query.get('metrics').split(',') : undefined,
      days: Math.min(365, Number(query.get('days')) || 28),
    });
    json(res, 200, result);
  } catch (err) {
    json(res, 502, { error: err.message });
  }
});

// Platform-tracked data vs GA4 over the same window — surfaces tracking
// gaps (snippet missing on pages, consent blocking, UTM mismatches).
route('GET', '/api/ga4/:siteId/compare', async (req, res, params, query) => {
  const site = requireGa4(res, params);
  if (!site) return;
  const days = Math.min(365, Number(query.get('days')) || 28);
  const cutoff = Date.now() - days * 86400e3;
  const events = store.find('events', (e) => e.siteId === site.id && Date.parse(e.createdAt) >= cutoff);
  const visitors = new Set(events.map((e) => e.visitorId)).size;
  const conversions = new Set(events.filter((e) => e.type === 'conversion').map((e) => e.visitorId)).size;
  const revenue = Math.round(events.reduce((s, e) => s + (e.type === 'conversion' && typeof e.value === 'number' ? e.value : 0), 0) * 100) / 100;
  try {
    const g = await ga4.report(site.ga4, { type: 'overview', days });
    const row = g.rows[0] || {};
    const gaUsers = row.totalUsers || 0;
    const diff = gaUsers ? Math.round(((visitors - gaUsers) / gaUsers) * 1000) / 10 : null;
    json(res, 200, {
      days,
      platform: { visitors, conversions, revenue },
      ga4: {
        sessions: row.sessions || 0, users: gaUsers,
        conversions: row.conversions || 0, revenue: row.purchaseRevenue || 0,
      },
      visitorDiffPct: diff,
      note: 'Differences of ±15% are normal (ad blockers, consent, bot filtering). Larger gaps usually mean the snippet or GA4 tag is missing on some pages.',
    });
  } catch (err) {
    json(res, 502, { error: err.message });
  }
});

route('GET', '/api/ga4/meta', (req, res) => {
  json(res, 200, { dimensions: ga4.DIMENSIONS, metrics: ga4.METRICS, canned: Object.keys(ga4.CANNED) });
});

// Saved reports (report builder definitions).
route('GET', '/api/reports', (req, res, params, query) => {
  let list = store.all('reports');
  if (query.get('siteId')) list = list.filter((r) => r.siteId === query.get('siteId'));
  json(res, 200, list);
});

route('POST', '/api/reports', async (req, res) => {
  const body = await readBody(req);
  if (!body.name) return json(res, 400, { error: 'name is required' });
  if (!body.siteId || !store.get('sites', body.siteId)) return json(res, 400, { error: 'valid siteId is required' });
  const dims = (Array.isArray(body.dimensions) ? body.dimensions : []).filter((d) => ga4.DIMENSIONS.includes(d));
  const mets = (Array.isArray(body.metrics) ? body.metrics : []).filter((m) => ga4.METRICS.includes(m));
  if (!mets.length) return json(res, 400, { error: `at least one metric from: ${ga4.METRICS.join(', ')}` });
  json(res, 201, store.insert('reports', {
    name: String(body.name).trim(),
    siteId: body.siteId,
    dimensions: dims,
    metrics: mets,
    days: Math.min(365, Number(body.days) || 28),
  }));
});

route('DELETE', '/api/reports/:id', (req, res, params) => {
  if (!store.remove('reports', params.id)) return json(res, 404, { error: 'report not found' });
  json(res, 200, { ok: true });
});

route('GET', '/api/reports/:id/run', async (req, res, params) => {
  const saved = store.get('reports', params.id);
  if (!saved) return json(res, 404, { error: 'report not found' });
  const site = store.get('sites', saved.siteId);
  if (!site || !site.ga4) return json(res, 400, { error: 'GA4 is not connected for this report\'s site' });
  try {
    const result = await ga4.report(site.ga4, saved);
    json(res, 200, { report: saved, ...result });
  } catch (err) {
    json(res, 502, { error: err.message });
  }
});

// ---------------------------------------------------------------- API: website performance (web vitals)

route('GET', '/api/performance', (req, res, params, query) => {
  json(res, 200, perf.performanceReport(siteEvents(query)));
});

// ---------------------------------------------------------------- API: experiments

route('GET', '/api/experiments', (req, res, params, query) => {
  let list = store.all('experiments');
  if (query.get('siteId')) list = list.filter((e) => e.siteId === query.get('siteId'));
  json(res, 200, list);
});

route('POST', '/api/experiments', async (req, res) => {
  const body = await readBody(req);
  const errors = validateExperiment(body);
  if (errors.length) return json(res, 400, { errors });
  if (!store.get('sites', body.siteId)) return json(res, 400, { errors: ['unknown siteId'] });
  const exp = store.insert('experiments', normalizeExperiment(body));
  json(res, 201, exp);
});

route('GET', '/api/experiments/:id', (req, res, params) => {
  const exp = store.get('experiments', params.id);
  if (!exp) return json(res, 404, { error: 'experiment not found' });
  json(res, 200, exp);
});

route('POST', '/api/experiments/:id/status', async (req, res, params) => {
  const body = await readBody(req);
  if (!VALID_STATUSES.includes(body.status)) {
    return json(res, 400, { error: `status must be one of ${VALID_STATUSES.join(', ')}` });
  }
  const patch = { status: body.status };
  if (body.status === 'running') patch.startedAt = new Date().toISOString();
  if (body.status === 'stopped') patch.stoppedAt = new Date().toISOString();
  const exp = store.update('experiments', params.id, patch);
  if (!exp) return json(res, 404, { error: 'experiment not found' });
  json(res, 200, exp);
});

// Results. ?segment=SEGMENT_ID computes a per-segment breakdown.
route('GET', '/api/experiments/:id/results', (req, res, params, query) => {
  const exp = store.get('experiments', params.id);
  if (!exp) return json(res, 404, { error: 'experiment not found' });
  let events = store.find('events', (e) => e.experimentId === exp.id);
  const segmentId = query.get('segment');
  if (segmentId) events = segments.filterEventsBySegment(events, segmentId);
  json(res, 200, { ...computeResults(exp, events), segment: segmentId || null });
});

route('DELETE', '/api/experiments/:id', (req, res, params) => {
  if (!store.remove('experiments', params.id)) return json(res, 404, { error: 'experiment not found' });
  json(res, 200, { ok: true });
});

// ---------------------------------------------------------------- API: audits

route('GET', '/api/audits', (req, res, params, query) => {
  let list = store.all('audits');
  if (query.get('siteId')) list = list.filter((a) => a.siteId === query.get('siteId'));
  // Newest first, summaries only.
  list = [...list].reverse().map((a) => ({
    id: a.id, url: a.url, siteId: a.siteId, createdAt: a.createdAt,
    score: a.report ? a.report.score : null, grade: a.report ? a.report.grade : null,
  }));
  json(res, 200, list);
});

route('POST', '/api/audits', async (req, res) => {
  const body = await readBody(req);
  if (!body.url && !body.html) return json(res, 400, { error: 'url or html is required' });
  try {
    let record;
    if (body.html) {
      // Direct HTML analysis (for pages behind auth, or local drafts).
      const report = analyzeHtml(String(body.html), body.url || '');
      record = { url: body.url || '(inline html)', siteId: body.siteId || null, ok: true, report };
    } else {
      const url = /^https?:\/\//i.test(body.url) ? body.url : `https://${body.url}`;
      const result = await runAudit(url);
      record = { ...result, siteId: body.siteId || null };
    }
    record.plan = recommendations.fromAudit(record.report);
    const audit = store.insert('audits', record);
    json(res, 201, audit);
  } catch (err) {
    json(res, 502, { error: `audit failed: ${err.message}` });
  }
});

route('GET', '/api/audits/:id', (req, res, params) => {
  const audit = store.get('audits', params.id);
  if (!audit) return json(res, 404, { error: 'audit not found' });
  json(res, 200, audit);
});

// ---------------------------------------------------------------- API: segments (audiences)

route('GET', '/api/segments', (req, res, params, query) => {
  const events = store.all('events');
  let list = store.all('segments');
  if (query.get('siteId')) list = list.filter((s) => !s.siteId || s.siteId === query.get('siteId'));
  json(res, 200, list.map((s) => ({ ...s, stats: segments.segmentStats(s, events) })));
});

route('POST', '/api/segments', async (req, res) => {
  const body = await readBody(req);
  const errors = segments.validateSegment(body);
  if (errors.length) return json(res, 400, { errors });
  json(res, 201, store.insert('segments', segments.normalizeSegment(body)));
});

route('DELETE', '/api/segments/:id', (req, res, params) => {
  const inUse = store.find('experiments', (e) => e.segmentId === params.id).length +
    store.find('personalizations', (p) => p.segmentId === params.id).length;
  if (inUse) return json(res, 409, { error: `segment is used by ${inUse} experiment(s)/personalization(s)` });
  if (!store.remove('segments', params.id)) return json(res, 404, { error: 'segment not found' });
  json(res, 200, { ok: true });
});

// ---------------------------------------------------------------- API: personalizations (experiences)

route('GET', '/api/personalizations', (req, res, params, query) => {
  let list = store.all('personalizations');
  if (query.get('siteId')) list = list.filter((p) => p.siteId === query.get('siteId'));
  json(res, 200, list);
});

route('POST', '/api/personalizations', async (req, res) => {
  const body = await readBody(req);
  const errors = personalization.validatePersonalization(body);
  if (errors.length) return json(res, 400, { errors });
  if (!store.get('sites', body.siteId)) return json(res, 400, { errors: ['unknown siteId'] });
  if (body.segmentId && !store.get('segments', body.segmentId)) {
    return json(res, 400, { errors: ['unknown segmentId'] });
  }
  json(res, 201, store.insert('personalizations', personalization.normalizePersonalization(body)));
});

route('POST', '/api/personalizations/:id/status', async (req, res, params) => {
  const body = await readBody(req);
  if (!personalization.VALID_STATUSES.includes(body.status)) {
    return json(res, 400, { error: `status must be one of ${personalization.VALID_STATUSES.join(', ')}` });
  }
  const patch = { status: body.status };
  if (body.status === 'running') patch.startedAt = new Date().toISOString();
  if (body.status === 'stopped') patch.stoppedAt = new Date().toISOString();
  const px = store.update('personalizations', params.id, patch);
  if (!px) return json(res, 404, { error: 'personalization not found' });
  json(res, 200, px);
});

route('GET', '/api/personalizations/:id/results', (req, res, params) => {
  const px = store.get('personalizations', params.id);
  if (!px) return json(res, 404, { error: 'personalization not found' });
  const events = store.find('events', (e) => e.siteId === px.siteId);
  json(res, 200, personalization.computePersonalizationResults(px, events));
});

route('DELETE', '/api/personalizations/:id', (req, res, params) => {
  if (!store.remove('personalizations', params.id)) return json(res, 404, { error: 'personalization not found' });
  json(res, 200, { ok: true });
});

// ---------------------------------------------------------------- API: custom funnels

route('GET', '/api/funnels', (req, res, params, query) => {
  let list = store.all('funnels');
  if (query.get('siteId')) list = list.filter((f) => !f.siteId || f.siteId === query.get('siteId'));
  json(res, 200, list);
});

route('POST', '/api/funnels', async (req, res) => {
  const body = await readBody(req);
  const errors = validateFunnel(body);
  if (errors.length) return json(res, 400, { errors });
  json(res, 201, store.insert('funnels', normalizeFunnel(body)));
});

route('DELETE', '/api/funnels/:id', (req, res, params) => {
  if (!store.remove('funnels', params.id)) return json(res, 404, { error: 'funnel not found' });
  json(res, 200, { ok: true });
});

// ---------------------------------------------------------------- API: campaigns (ad spend)

route('GET', '/api/campaigns', (req, res, params, query) => {
  let list = store.all('campaigns');
  if (query.get('siteId')) list = list.filter((c) => c.siteId === query.get('siteId'));
  json(res, 200, list);
});

route('POST', '/api/campaigns', async (req, res) => {
  const body = await readBody(req);
  const errors = [];
  if (!body.name) errors.push('name is required');
  if (!body.utmSource) errors.push('utmSource is required (must match the utm_source on your ads)');
  if (body.spend == null || typeof body.spend !== 'number' || body.spend < 0) errors.push('spend must be a non-negative number');
  if (errors.length) return json(res, 400, { errors });
  const campaign = store.insert('campaigns', {
    name: String(body.name).trim(),
    siteId: body.siteId || null,
    channel: body.channel || '', // e.g. "Meta Ads", "Google Ads" — display only
    utmSource: String(body.utmSource).trim().toLowerCase(),
    utmMedium: body.utmMedium ? String(body.utmMedium).trim().toLowerCase() : 'cpc',
    utmCampaign: body.utmCampaign ? String(body.utmCampaign).trim().toLowerCase() : '',
    spend: body.spend,
    clicks: typeof body.clicks === 'number' ? body.clicks : 0,
    impressions: typeof body.impressions === 'number' ? body.impressions : 0,
    period: body.period || '', // free-form, e.g. "2026-06"
  });
  json(res, 201, campaign);
});

route('DELETE', '/api/campaigns/:id', (req, res, params) => {
  if (!store.remove('campaigns', params.id)) return json(res, 404, { error: 'campaign not found' });
  json(res, 200, { ok: true });
});

// ---------------------------------------------------------------- API: channels, funnel, insights

function siteEvents(query) {
  const siteId = query.get('siteId');
  return siteId ? store.find('events', (e) => e.siteId === siteId) : store.all('events');
}
function siteCampaigns(query) {
  const siteId = query.get('siteId');
  return siteId ? store.find('campaigns', (c) => !c.siteId || c.siteId === siteId) : store.all('campaigns');
}

route('GET', '/api/channels', (req, res, params, query) => {
  const model = query.get('model') === 'first' ? 'first' : 'last';
  json(res, 200, channelReport(siteEvents(query), siteCampaigns(query), model));
});

// Funnel report. Filters: ?funnelId= (custom funnel), ?segment=, ?source=.
route('GET', '/api/funnel', (req, res, params, query) => {
  let events = siteEvents(query);
  if (query.get('segment')) events = segments.filterEventsBySegment(events, query.get('segment'));
  if (query.get('source')) events = filterEventsBySource(events, query.get('source'));
  let stages = DEFAULT_FUNNEL;
  let funnel = null;
  if (query.get('funnelId')) {
    funnel = store.get('funnels', query.get('funnelId'));
    if (!funnel) return json(res, 404, { error: 'funnel not found' });
    stages = funnel.steps;
  }
  json(res, 200, {
    funnelId: funnel ? funnel.id : null,
    name: funnel ? funnel.name : 'Default DTC funnel',
    filters: { segment: query.get('segment') || null, source: query.get('source') || null },
    ...funnelReport(events, stages),
  });
});

route('GET', '/api/insights', (req, res, params, query) => {
  const events = siteEvents(query);
  const campaigns = siteCampaigns(query);
  const experiments = store.all('experiments');
  const experimentResults = new Map(
    experiments.map((exp) => [
      exp.id,
      computeResults(exp, store.find('events', (e) => e.experimentId === exp.id)),
    ])
  );
  const personalizations = store.all('personalizations');
  const personalizationResults = new Map(
    personalizations.map((px) => [
      px.id,
      personalization.computePersonalizationResults(px, store.find('events', (e) => e.siteId === px.siteId)),
    ])
  );
  json(res, 200, {
    insights: generateInsights({
      channels: channelReport(events, campaigns, 'last'),
      funnel: funnelReport(events),
      campaigns, experiments, experimentResults,
      personalizations, personalizationResults,
      performance: perf.performanceReport(events),
    }),
  });
});

// ---------------------------------------------------------------- API: playbooks & overview

route('GET', '/api/playbooks', (req, res, params, query) => {
  json(res, 200, {
    categories: recommendations.CATEGORIES,
    playbooks: recommendations.list({
      category: query.get('category') || undefined,
      skill: query.get('skill') || undefined,
    }),
  });
});

route('GET', '/api/overview', (req, res) => {
  const events = store.all('events');
  const experiments = store.all('experiments');
  const running = experiments.filter((e) => e.status === 'running');
  const visitors = new Set(events.map((e) => e.visitorId)).size;
  const conversionEvents = events.filter((e) => e.type === 'conversion');
  const revenue = Math.round(conversionEvents.reduce((s, e) => s + (typeof e.value === 'number' ? e.value : 0), 0) * 100) / 100;
  const spend = Math.round(store.all('campaigns').reduce((s, c) => s + (c.spend || 0), 0) * 100) / 100;
  const audits = store.all('audits');
  const lastAudit = audits[audits.length - 1];
  json(res, 200, {
    sites: store.all('sites').length,
    experiments: experiments.length,
    runningExperiments: running.length,
    visitors,
    conversions: conversionEvents.length,
    revenue,
    spend,
    roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : null,
    events: events.length,
    audits: audits.length,
    lastAuditScore: lastAudit && lastAudit.report ? lastAudit.report.score : null,
  });
});

// ---------------------------------------------------------------- Tracking endpoints (public, CORS-open)

// Active config consumed by the snippet: running experiments and
// personalizations, plus segment rules for client-side audience matching.
route('GET', '/t/config', (req, res, params, query) => {
  const siteId = query.get('site');
  const experiments = store
    .find('experiments', (e) => e.siteId === siteId && e.status === 'running')
    .map((e) => ({ id: e.id, name: e.name, goal: e.goal, url: e.url, segmentId: e.segmentId || null, variants: e.variants }));
  const personalizations = store
    .find('personalizations', (p) => p.siteId === siteId && p.status === 'running')
    .map((p) => ({ id: p.id, name: p.name, segmentId: p.segmentId, goal: p.goal, url: p.url, holdback: p.holdback, changes: p.changes }));
  const segs = store
    .find('segments', (s) => !s.siteId || s.siteId === siteId)
    .map((s) => ({ id: s.id, rules: s.rules }));
  json(res, 200, { experiments, personalizations, segments: segs });
});

const VALID_EVENT_TYPES = ['pageview', 'assignment', 'conversion', 'track', 'personalization', 'vital'];
const VALID_VITALS = ['LCP', 'CLS', 'INP', 'TTFB'];
const TOUCH_KEYS = ['source', 'medium', 'campaign', 'content', 'term', 'referrer', 'landing'];

function sanitizeTouch(t) {
  if (!t || typeof t !== 'object') return null;
  const out = {};
  let any = false;
  for (const k of TOUCH_KEYS) {
    if (t[k] != null && t[k] !== '') {
      out[k] = String(t[k]).slice(0, 300);
      any = true;
    }
  }
  return any ? out : null;
}

route('POST', '/t/collect', async (req, res) => {
  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return json(res, 400, { error: err.message });
  }
  const events = Array.isArray(body.events) ? body.events : [body];
  const accepted = [];
  for (const e of events.slice(0, 50)) {
    if (!e || !VALID_EVENT_TYPES.includes(e.type) || !e.siteId || !e.visitorId) continue;
    if (e.type === 'track' && !e.name) continue;
    if (e.type === 'personalization' && (!e.personalizationId || !['experience', 'holdback'].includes(e.group))) continue;
    if (e.type === 'vital' && (!VALID_VITALS.includes(e.name) || typeof e.value !== 'number' || !isFinite(e.value))) continue;
    accepted.push(
      store.insert('events', {
        type: e.type,
        siteId: String(e.siteId),
        visitorId: String(e.visitorId),
        experimentId: e.experimentId ? String(e.experimentId) : null,
        variantId: e.variantId ? String(e.variantId) : null,
        personalizationId: e.personalizationId ? String(e.personalizationId) : null,
        group: e.group ? String(e.group) : null,
        goal: e.goal ? String(e.goal) : null,
        name: e.name ? String(e.name).slice(0, 100) : null,
        value: typeof e.value === 'number' && isFinite(e.value) ? e.value : null,
        segments: Array.isArray(e.segments)
          ? e.segments.slice(0, 20).map((s) => String(s).slice(0, 64))
          : [],
        ft: sanitizeTouch(e.ft),
        lt: sanitizeTouch(e.lt),
        url: e.url ? String(e.url).slice(0, 500) : null,
      })
    );
  }
  json(res, 200, { accepted: accepted.length });
});

// The embeddable tracking + experimentation snippet.
route('GET', '/t/snippet.js', (req, res, params, query) => {
  const siteId = query.get('site') || 'SITE_ID';
  const template = fs.readFileSync(path.join(__dirname, 'lib', 'snippet.template.js'), 'utf8');
  const js = template.replaceAll('__SITE_ID__', JSON.stringify(siteId));
  res.writeHead(200, {
    'content-type': 'application/javascript; charset=utf-8',
    'access-control-allow-origin': '*',
    'cache-control': 'no-cache',
  });
  res.end(js);
});

// ---------------------------------------------------------------- static files

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = path.join(PUBLIC_DIR, path.normalize(rel));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback for client-side routes.
      if (!path.extname(rel)) {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, index) => {
          if (e2) { res.writeHead(404); res.end('not found'); return; }
          res.writeHead(200, { 'content-type': MIME['.html'] });
          res.end(index);
        });
        return;
      }
      res.writeHead(404); res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

// ---------------------------------------------------------------- server

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
    });
    res.end();
    return;
  }

  const match = matchRoute(req.method, pathname);
  if (match) {
    // Auth gate: /api/* requires a session, except health and the
    // signup/login/logout endpoints. Tracking (/t/*) stays public.
    const isApi = pathname.startsWith('/api/');
    const isPublicApi = pathname === '/api/health' ||
      (pathname.startsWith('/api/auth/') && pathname !== '/api/auth/me');
    if (isApi && !isPublicApi) {
      const userId = auth.verifySession(auth.tokenFromRequest(req), SESSION_SECRET);
      const user = userId ? store.get('users', userId) : null;
      if (!user) return json(res, 401, { error: 'authentication required' });
      req.user = user;
    }
    try {
      await match.handler(req, res, match.params, url.searchParams);
    } catch (err) {
      json(res, err.message === 'invalid JSON body' || err.message === 'payload too large' ? 400 : 500, {
        error: err.message,
      });
    }
    return;
  }

  if (pathname.startsWith('/api/') || pathname.startsWith('/t/')) {
    return json(res, 404, { error: 'not found' });
  }

  serveStatic(req, res, pathname);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`CRO Platform running at http://localhost:${PORT}`);
    console.log(`Data file: ${DATA_FILE}`);
  });
}

module.exports = { server, store };
