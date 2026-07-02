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

// ---------------------------------------------------------------- API: sites

route('GET', '/api/health', (req, res) => json(res, 200, { ok: true, now: new Date().toISOString() }));

route('GET', '/api/sites', (req, res) => {
  const sites = store.all('sites').map((s) => ({
    ...s,
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
  });
  json(res, 201, site);
});

route('GET', '/api/sites/:id', (req, res, params) => {
  const site = store.get('sites', params.id);
  if (!site) return json(res, 404, { error: 'site not found' });
  json(res, 200, site);
});

route('DELETE', '/api/sites/:id', (req, res, params) => {
  if (!store.remove('sites', params.id)) return json(res, 404, { error: 'site not found' });
  json(res, 200, { ok: true });
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

const VALID_EVENT_TYPES = ['pageview', 'assignment', 'conversion', 'track', 'personalization'];
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
