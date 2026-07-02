'use strict';
const test = require('node:test');
const assert = require('node:assert');
const {
  validateExperiment, normalizeExperiment, assignVariant, computeResults, fnv1a,
} = require('../lib/experiments');

const baseBody = {
  name: 'Hero test',
  siteId: 'site_1',
  goal: 'purchase',
  variants: [{ name: 'Control' }, { name: 'B' }],
};

test('validateExperiment accepts a valid body', () => {
  assert.deepStrictEqual(validateExperiment(baseBody), []);
});

test('validateExperiment rejects missing fields and single variant', () => {
  assert.ok(validateExperiment({}).length >= 3);
  assert.ok(validateExperiment({ ...baseBody, variants: [{ name: 'only' }] })
    .some((e) => e.includes('2 variants')));
});

test('normalizeExperiment assigns variant ids and defaults', () => {
  const exp = normalizeExperiment(baseBody);
  assert.strictEqual(exp.status, 'draft');
  assert.deepStrictEqual(exp.variants.map((v) => v.id), ['v0', 'v1']);
  assert.strictEqual(exp.variants[0].weight, 1);
});

test('fnv1a is deterministic', () => {
  assert.strictEqual(fnv1a('hello'), fnv1a('hello'));
  assert.notStrictEqual(fnv1a('hello'), fnv1a('hellp'));
});

test('assignVariant is stable per visitor and splits roughly by weight', () => {
  const exp = { id: 'exp_1', variants: [{ id: 'v0', weight: 1 }, { id: 'v1', weight: 1 }] };
  const counts = { v0: 0, v1: 0 };
  for (let i = 0; i < 10000; i++) {
    const v = assignVariant(exp, `visitor_${i}`);
    assert.strictEqual(v.id, assignVariant(exp, `visitor_${i}`).id); // stable
    counts[v.id]++;
  }
  const ratio = counts.v0 / 10000;
  assert.ok(ratio > 0.45 && ratio < 0.55, `split was ${ratio}`);
});

test('assignVariant respects unequal weights', () => {
  const exp = { id: 'exp_w', variants: [{ id: 'v0', weight: 3 }, { id: 'v1', weight: 1 }] };
  let v0 = 0;
  for (let i = 0; i < 10000; i++) if (assignVariant(exp, `u${i}`).id === 'v0') v0++;
  assert.ok(v0 / 10000 > 0.70 && v0 / 10000 < 0.80, `v0 share was ${v0 / 10000}`);
});

test('computeResults counts unique visitors and conversions per variant', () => {
  const exp = {
    id: 'exp_1', goal: 'purchase', status: 'running',
    variants: [{ id: 'v0', name: 'Control', weight: 1 }, { id: 'v1', name: 'B', weight: 1 }],
  };
  const events = [
    { experimentId: 'exp_1', variantId: 'v0', visitorId: 'a', type: 'assignment' },
    { experimentId: 'exp_1', variantId: 'v0', visitorId: 'a', type: 'assignment' }, // dup visitor
    { experimentId: 'exp_1', variantId: 'v0', visitorId: 'b', type: 'assignment' },
    { experimentId: 'exp_1', variantId: 'v0', visitorId: 'a', type: 'conversion', goal: 'purchase' },
    { experimentId: 'exp_1', variantId: 'v0', visitorId: 'a', type: 'conversion', goal: 'purchase' }, // dup conv
    { experimentId: 'exp_1', variantId: 'v1', visitorId: 'c', type: 'assignment' },
    { experimentId: 'exp_1', variantId: 'v1', visitorId: 'c', type: 'conversion', goal: 'other-goal' }, // wrong goal
    { experimentId: 'other', variantId: 'v0', visitorId: 'z', type: 'assignment' }, // other experiment
  ];
  const r = computeResults(exp, events);
  const [control, b] = r.variants;
  assert.strictEqual(control.visitors, 2);
  assert.strictEqual(control.conversions, 1);
  assert.strictEqual(b.visitors, 1);
  assert.strictEqual(b.conversions, 0);
  assert.strictEqual(r.comparisons.length, 1);
});
