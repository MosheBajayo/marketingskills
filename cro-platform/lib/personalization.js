// Personalization "experiences" (Dynamic Yield-style): serve a targeted
// experience to a segment, holding back a control share of that segment
// so the lift is measurable with the same statistics as an A/B test.
'use strict';

const { fnv1a } = require('./experiments');
const { twoProportionTest, wilsonInterval } = require('./stats');

const VALID_STATUSES = ['draft', 'running', 'stopped'];

function validatePersonalization(body) {
  const errors = [];
  if (!body.name) errors.push('name is required');
  if (!body.siteId) errors.push('siteId is required');
  if (!Array.isArray(body.changes) || body.changes.length === 0) {
    errors.push('at least one DOM change is required (that is the experience)');
  } else {
    body.changes.forEach((c, i) => {
      if (!c.selector) errors.push(`changes[${i}].selector is required`);
      if (!['text', 'html', 'style', 'hide'].includes(c.type)) errors.push(`changes[${i}].type must be text|html|style|hide`);
    });
  }
  if (body.holdback != null && (typeof body.holdback !== 'number' || body.holdback < 0 || body.holdback > 50)) {
    errors.push('holdback must be a number between 0 and 50 (percent held back as control)');
  }
  return errors;
}

function normalizePersonalization(body) {
  return {
    name: String(body.name).trim(),
    siteId: body.siteId,
    segmentId: body.segmentId || null, // null = all visitors
    goal: body.goal ? String(body.goal).trim() : 'purchase',
    url: body.url || '',
    holdback: body.holdback != null ? body.holdback : 10,
    status: 'draft',
    changes: body.changes.map((c) => ({
      selector: String(c.selector),
      type: c.type,
      value: c.value != null ? String(c.value) : '',
    })),
  };
}

// Deterministic holdback split — must match snippet.template.js.
function assignGroup(personalization, visitorId) {
  const bucket = fnv1a(`px:${personalization.id}:${visitorId}`) % 100;
  return bucket < personalization.holdback ? 'holdback' : 'experience';
}

// Results: experience vs holdback among visitors who received an
// impression, with the holdback as the control arm of a z-test.
function computePersonalizationResults(personalization, events) {
  const groups = {
    holdback: { visitors: new Set(), converters: new Set(), revenue: 0 },
    experience: { visitors: new Set(), converters: new Set(), revenue: 0 },
  };
  const groupOf = new Map(); // visitorId -> group (from impression events)

  for (const e of events) {
    if (e.type === 'personalization' && e.personalizationId === personalization.id && groups[e.group]) {
      groups[e.group].visitors.add(e.visitorId);
      groupOf.set(e.visitorId, e.group);
    }
  }
  for (const e of events) {
    if (e.type !== 'conversion') continue;
    if (e.goal && e.goal !== personalization.goal) continue;
    const g = groupOf.get(e.visitorId);
    if (!g) continue;
    if (!groups[g].converters.has(e.visitorId) && typeof e.value === 'number') groups[g].revenue += e.value;
    groups[g].converters.add(e.visitorId);
  }

  const arm = (g) => {
    const visitors = groups[g].visitors.size;
    const conversions = groups[g].converters.size;
    return {
      group: g, visitors, conversions,
      rate: visitors ? conversions / visitors : 0,
      interval: wilsonInterval(conversions, visitors),
      revenue: Math.round(groups[g].revenue * 100) / 100,
    };
  };
  const holdback = arm('holdback');
  const experience = arm('experience');
  return {
    personalizationId: personalization.id,
    goal: personalization.goal,
    status: personalization.status,
    holdbackPct: personalization.holdback,
    arms: [holdback, experience],
    vsHoldback: twoProportionTest(
      { visitors: holdback.visitors, conversions: holdback.conversions },
      { visitors: experience.visitors, conversions: experience.conversions }
    ),
  };
}

module.exports = {
  VALID_STATUSES,
  validatePersonalization,
  normalizePersonalization,
  assignGroup,
  computePersonalizationResults,
};
