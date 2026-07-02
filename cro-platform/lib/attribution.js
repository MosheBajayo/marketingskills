// Attribution & funnel analytics: turn raw events + campaign spend into a
// channel performance report (visitors, conversions, revenue, ROAS, CPA)
// and a funnel report with per-stage drop-off.
'use strict';

const SEARCH_ENGINES = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'ecosia.'];
const SOCIAL_REFERRERS = ['facebook.', 'instagram.', 'tiktok.', 'pinterest.', 'twitter.', 't.co', 'linkedin.', 'youtube.', 'reddit.'];

// Normalize a touch ({source, medium, campaign, referrer, landing}) into a
// channel key. Falls back to referrer classification, then "direct".
function deriveChannel(touch) {
  if (touch && touch.source) {
    return {
      source: String(touch.source).toLowerCase(),
      medium: String(touch.medium || '(none)').toLowerCase(),
      campaign: String(touch.campaign || '(none)').toLowerCase(),
    };
  }
  const ref = touch && touch.referrer ? String(touch.referrer).toLowerCase() : '';
  if (ref) {
    let host = ref;
    try { host = new URL(ref).hostname; } catch { /* keep raw */ }
    if (SEARCH_ENGINES.some((s) => host.includes(s))) {
      return { source: host.replace(/^www\./, '').split('.')[0], medium: 'organic', campaign: '(none)' };
    }
    if (SOCIAL_REFERRERS.some((s) => host.includes(s))) {
      return { source: host.replace(/^www\./, '').split('.')[0], medium: 'social', campaign: '(none)' };
    }
    return { source: host.replace(/^www\./, ''), medium: 'referral', campaign: '(none)' };
  }
  return { source: 'direct', medium: '(none)', campaign: '(none)' };
}

function channelKey(c) {
  return `${c.source} / ${c.medium} / ${c.campaign}`;
}

// Pick each visitor's attributed touch: first event's ft (first-touch model)
// or last event's lt (last-touch model). Events must be in insertion order.
function visitorTouches(events, model) {
  const byVisitor = new Map();
  for (const e of events) {
    if (!e.visitorId) continue;
    if (!byVisitor.has(e.visitorId)) byVisitor.set(e.visitorId, null);
    if (model === 'first') {
      if (byVisitor.get(e.visitorId) == null && e.ft) byVisitor.set(e.visitorId, e.ft);
    } else if (e.lt) {
      byVisitor.set(e.visitorId, e.lt);
    }
  }
  return byVisitor;
}

// Channel performance report.
// events: raw events; campaigns: spend entries {utmSource, utmMedium,
// utmCampaign, spend, clicks, impressions}; model: 'last' | 'first'.
function channelReport(events, campaigns = [], model = 'last') {
  const touches = visitorTouches(events, model);
  const rows = new Map();
  const rowFor = (channel) => {
    const key = channelKey(channel);
    if (!rows.has(key)) {
      rows.set(key, {
        key, ...channel,
        visitors: 0, converters: new Set(), conversions: 0, revenue: 0,
        spend: 0, clicks: 0, impressions: 0, hasSpend: false,
      });
    }
    return rows.get(key);
  };

  const visitorChannel = new Map();
  for (const [visitorId, touch] of touches) {
    const channel = deriveChannel(touch);
    visitorChannel.set(visitorId, channel);
    rowFor(channel).visitors++;
  }

  for (const e of events) {
    if (e.type !== 'conversion') continue;
    const channel = visitorChannel.get(e.visitorId);
    if (!channel) continue;
    const row = rowFor(channel);
    row.conversions++;
    row.converters.add(e.visitorId);
    if (typeof e.value === 'number') row.revenue += e.value;
  }

  // Match spend entries onto channel rows (creates a row if no traffic matched,
  // which itself is a signal: money spent, nothing tracked).
  for (const c of campaigns) {
    const channel = deriveChannel({ source: c.utmSource, medium: c.utmMedium, campaign: c.utmCampaign });
    const row = rowFor(channel);
    row.spend += c.spend || 0;
    row.clicks += c.clicks || 0;
    row.impressions += c.impressions || 0;
    row.hasSpend = true;
  }

  const out = [...rows.values()].map((r) => {
    const uniqueConverters = r.converters.size;
    return {
      key: r.key, source: r.source, medium: r.medium, campaign: r.campaign,
      visitors: r.visitors,
      conversions: uniqueConverters,
      cvr: r.visitors ? uniqueConverters / r.visitors : null,
      revenue: round2(r.revenue),
      aov: uniqueConverters ? round2(r.revenue / uniqueConverters) : null,
      spend: round2(r.spend),
      clicks: r.clicks, impressions: r.impressions,
      ctr: r.impressions ? r.clicks / r.impressions : null,
      cpc: r.clicks && r.spend ? round2(r.spend / r.clicks) : null,
      cpa: r.spend && uniqueConverters ? round2(r.spend / uniqueConverters) : null,
      roas: r.spend ? round2(r.revenue / r.spend) : null,
      hasSpend: r.hasSpend,
    };
  }).sort((a, b) => b.revenue - a.revenue || b.visitors - a.visitors);

  const totals = out.reduce((t, r) => ({
    visitors: t.visitors + r.visitors,
    conversions: t.conversions + r.conversions,
    revenue: round2(t.revenue + r.revenue),
    spend: round2(t.spend + r.spend),
  }), { visitors: 0, conversions: 0, revenue: 0, spend: 0 });
  totals.cvr = totals.visitors ? totals.conversions / totals.visitors : null;
  totals.roas = totals.spend ? round2(totals.revenue / totals.spend) : null;
  totals.cpa = totals.spend && totals.conversions ? round2(totals.spend / totals.conversions) : null;

  return { model, rows: out, totals };
}

// Default DTC funnel. Stages match events by type (+ name/goal).
const DEFAULT_FUNNEL = [
  { id: 'visit', label: 'Visited site', type: 'pageview' },
  { id: 'add_to_cart', label: 'Added to cart', type: 'track', name: 'add_to_cart' },
  { id: 'begin_checkout', label: 'Began checkout', type: 'track', name: 'begin_checkout' },
  { id: 'purchase', label: 'Purchased', type: 'conversion', goal: 'purchase' },
];

function eventMatchesStage(e, stage) {
  if (e.type !== stage.type) return false;
  if (stage.type === 'track') return e.name === stage.name;
  if (stage.type === 'conversion') return !stage.goal || e.goal === stage.goal;
  if (stage.type === 'pageview') return !stage.urlContains || (e.url || '').includes(stage.urlContains);
  return true;
}

// ---- custom funnels (Superfunnel-style) ----

const STEP_TYPES = ['pageview', 'track', 'conversion'];

function validateFunnel(body) {
  const errors = [];
  if (!body.name) errors.push('name is required');
  if (!Array.isArray(body.steps) || body.steps.length < 2) {
    errors.push('at least 2 steps are required');
  } else {
    body.steps.forEach((s, i) => {
      if (!s.label) errors.push(`steps[${i}].label is required`);
      if (!STEP_TYPES.includes(s.type)) errors.push(`steps[${i}].type must be one of ${STEP_TYPES.join(', ')}`);
      if (s.type === 'track' && !s.name) errors.push(`steps[${i}].name is required for track steps`);
    });
  }
  return errors;
}

function normalizeFunnel(body) {
  return {
    name: String(body.name).trim(),
    siteId: body.siteId || null,
    steps: body.steps.map((s, i) => ({
      id: s.id || `s${i}`,
      label: String(s.label).trim(),
      type: s.type,
      name: s.type === 'track' ? String(s.name).trim() : undefined,
      goal: s.type === 'conversion' && s.goal ? String(s.goal).trim() : undefined,
      urlContains: s.type === 'pageview' && s.urlContains ? String(s.urlContains).trim() : undefined,
    })),
  };
}

// Restrict events to visitors whose attributed channel source matches
// (last-touch). Used for funnel-by-channel comparison.
function filterEventsBySource(events, source) {
  const touches = visitorTouches(events, 'last');
  const members = new Set();
  for (const [visitorId, touch] of touches) {
    if (deriveChannel(touch).source === String(source).toLowerCase()) members.add(visitorId);
  }
  return events.filter((e) => members.has(e.visitorId));
}

// Funnel report: unique visitors per stage + step and overall conversion.
function funnelReport(events, stages = DEFAULT_FUNNEL) {
  const stageVisitors = stages.map(() => new Set());
  for (const e of events) {
    if (!e.visitorId) continue;
    for (let i = 0; i < stages.length; i++) {
      if (eventMatchesStage(e, stages[i])) stageVisitors[i].add(e.visitorId);
    }
  }
  const first = stageVisitors[0] ? stageVisitors[0].size : 0;
  const out = stages.map((stage, i) => {
    const count = stageVisitors[i].size;
    const prev = i === 0 ? null : stageVisitors[i - 1].size;
    return {
      id: stage.id, label: stage.label, visitors: count,
      stepRate: prev ? count / prev : null,
      overallRate: first ? count / first : null,
      dropOff: prev ? prev - count : null,
    };
  });
  // Biggest leak: the step losing the largest share of remaining visitors.
  let leak = null;
  for (let i = 1; i < out.length; i++) {
    const loss = out[i].stepRate == null ? 0 : 1 - out[i].stepRate;
    if (out[i - 1].visitors >= 20 && (!leak || loss > leak.loss)) {
      leak = { from: out[i - 1].id, to: out[i].id, loss };
    }
  }
  return { stages: out, leak };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  deriveChannel, channelKey, channelReport, funnelReport, DEFAULT_FUNNEL,
  validateFunnel, normalizeFunnel, filterEventsBySource,
};
