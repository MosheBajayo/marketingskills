// Experiment domain logic: validation, deterministic variant assignment,
// and results computation from raw events.
'use strict';

const { twoProportionTest, wilsonInterval, srmCheck, requiredSampleSize } = require('./stats');

const VALID_STATUSES = ['draft', 'running', 'stopped'];

function validateExperiment(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string') errors.push('name is required');
  if (!body.siteId) errors.push('siteId is required');
  if (!body.goal || typeof body.goal !== 'string') errors.push('goal is required (e.g. "purchase")');
  if (!Array.isArray(body.variants) || body.variants.length < 2) {
    errors.push('at least 2 variants are required');
  } else {
    body.variants.forEach((v, i) => {
      if (!v.name) errors.push(`variants[${i}].name is required`);
      if (v.weight != null && (typeof v.weight !== 'number' || v.weight <= 0)) {
        errors.push(`variants[${i}].weight must be a positive number`);
      }
      if (v.changes != null && !Array.isArray(v.changes)) {
        errors.push(`variants[${i}].changes must be an array`);
      }
    });
  }
  return errors;
}

function normalizeExperiment(body) {
  return {
    name: body.name.trim(),
    siteId: body.siteId,
    goal: body.goal.trim(),
    hypothesis: body.hypothesis || '',
    url: body.url || '',
    status: 'draft',
    variants: body.variants.map((v, i) => ({
      id: v.id || `v${i}`,
      name: v.name,
      weight: v.weight || 1,
      // DOM changes the snippet applies: {selector, type: text|html|style|hide, value}
      changes: Array.isArray(v.changes) ? v.changes : [],
    })),
  };
}

// FNV-1a hash for deterministic, uniform visitor→variant bucketing.
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function assignVariant(experiment, visitorId) {
  const totalWeight = experiment.variants.reduce((s, v) => s + v.weight, 0);
  const bucket = (fnv1a(`${experiment.id}:${visitorId}`) % 10000) / 10000 * totalWeight;
  let acc = 0;
  for (const v of experiment.variants) {
    acc += v.weight;
    if (bucket < acc) return v;
  }
  return experiment.variants[experiment.variants.length - 1];
}

// Compute per-variant results from raw events. Unique visitors are counted
// once per variant; conversions count unique converting visitors.
function computeResults(experiment, events) {
  const perVariant = new Map(
    experiment.variants.map((v) => [v.id, { visitors: new Set(), converters: new Set() }])
  );

  for (const e of events) {
    if (e.experimentId !== experiment.id) continue;
    const slot = perVariant.get(e.variantId);
    if (!slot) continue;
    if (e.type === 'assignment' || e.type === 'pageview') slot.visitors.add(e.visitorId);
    if (e.type === 'conversion' && (!e.goal || e.goal === experiment.goal)) {
      slot.visitors.add(e.visitorId);
      slot.converters.add(e.visitorId);
    }
  }

  const variants = experiment.variants.map((v) => {
    const slot = perVariant.get(v.id);
    const visitors = slot.visitors.size;
    const conversions = slot.converters.size;
    return {
      id: v.id,
      name: v.name,
      weight: v.weight,
      visitors,
      conversions,
      rate: visitors ? conversions / visitors : 0,
      interval: wilsonInterval(conversions, visitors),
    };
  });

  const control = variants[0];
  const comparisons = variants.slice(1).map((v) => ({
    variantId: v.id,
    vsControl: twoProportionTest(
      { visitors: control.visitors, conversions: control.conversions },
      { visitors: v.visitors, conversions: v.conversions }
    ),
  }));

  const srm = srmCheck(
    variants.map((v) => v.visitors),
    experiment.variants.map((v) => v.weight)
  );

  const baseline = control.visitors ? control.rate : 0.02;
  return {
    experimentId: experiment.id,
    goal: experiment.goal,
    status: experiment.status,
    variants,
    comparisons,
    srm,
    guidance: {
      requiredSamplePerVariant: requiredSampleSize(baseline || 0.02, 0.15),
      note: 'Sample size for 80% power to detect a 15% relative lift at the observed control rate.',
    },
  };
}

module.exports = {
  VALID_STATUSES,
  validateExperiment,
  normalizeExperiment,
  assignVariant,
  computeResults,
  fnv1a,
};
