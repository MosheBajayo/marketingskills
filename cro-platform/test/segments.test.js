'use strict';
const test = require('node:test');
const assert = require('node:assert');
const {
  validateSegment, evaluateSegment, matchedSegmentIds, segmentStats, filterEventsBySegment,
} = require('../lib/segments');
const {
  validatePersonalization, normalizePersonalization, assignGroup, computePersonalizationResults,
} = require('../lib/personalization');
const { validateFunnel, funnelReport, filterEventsBySource } = require('../lib/attribution');

// ---------- segments ----------

test('validateSegment rejects bad attrs/ops and empty rules', () => {
  assert.ok(validateSegment({ name: 'x', rules: [] }).length);
  assert.ok(validateSegment({ name: 'x', rules: [{ attr: 'nope', op: 'is', value: '1' }] })
    .some((e) => e.includes('attr')));
  assert.deepStrictEqual(
    validateSegment({ name: 'x', rules: [{ attr: 'device', op: 'is', value: 'mobile' }] }), []);
});

test('evaluateSegment ANDs rules with all operators', () => {
  const seg = {
    rules: [
      { attr: 'device', op: 'is', value: 'Mobile' },          // case-insensitive
      { attr: 'source', op: 'is_not', value: 'google' },
      { attr: 'path', op: 'contains', value: '/products' },
      { attr: 'visits', op: 'gt', value: '1' },
    ],
  };
  const attrs = { device: 'mobile', source: 'meta', path: '/products/serum', visits: 3 };
  assert.strictEqual(evaluateSegment(seg, attrs), true);
  assert.strictEqual(evaluateSegment(seg, { ...attrs, visits: 1 }), false);
  assert.strictEqual(evaluateSegment(seg, { ...attrs, source: 'google' }), false);
});

test('boolean attributes compare against string values', () => {
  const seg = { rules: [{ attr: 'returning', op: 'is', value: 'true' }] };
  assert.strictEqual(evaluateSegment(seg, { returning: true }), true);
  assert.strictEqual(evaluateSegment(seg, { returning: false }), false);
});

test('matchedSegmentIds and segmentStats work over tagged events', () => {
  const segs = [
    { id: 's1', rules: [{ attr: 'device', op: 'is', value: 'mobile' }] },
    { id: 's2', rules: [{ attr: 'device', op: 'is', value: 'desktop' }] },
  ];
  assert.deepStrictEqual(matchedSegmentIds(segs, { device: 'mobile' }), ['s1']);

  const events = [
    { visitorId: 'a', type: 'pageview', segments: ['s1'] },
    { visitorId: 'a', type: 'conversion', value: 50, segments: ['s1'] },
    { visitorId: 'b', type: 'pageview', segments: ['s2'] },
  ];
  const stats = segmentStats(segs[0], events);
  assert.deepStrictEqual(stats, { visitors: 1, conversions: 1, cvr: 1, revenue: 50 });
  assert.strictEqual(filterEventsBySegment(events, 's1').length, 2);
});

// ---------- personalization ----------

test('validatePersonalization requires changes and sane holdback', () => {
  assert.ok(validatePersonalization({ name: 'x', siteId: 's', changes: [] }).length);
  assert.ok(validatePersonalization({
    name: 'x', siteId: 's', holdback: 90,
    changes: [{ selector: 'h1', type: 'text', value: 'Hi' }],
  }).some((e) => e.includes('holdback')));
  assert.deepStrictEqual(validatePersonalization({
    name: 'x', siteId: 's', changes: [{ selector: 'h1', type: 'text', value: 'Hi' }],
  }), []);
});

test('assignGroup splits deterministically at roughly the holdback share', () => {
  const px = { id: 'px1', holdback: 20 };
  let holdback = 0;
  for (let i = 0; i < 10000; i++) {
    const g = assignGroup(px, `v${i}`);
    assert.strictEqual(g, assignGroup(px, `v${i}`)); // stable
    if (g === 'holdback') holdback++;
  }
  assert.ok(holdback / 10000 > 0.16 && holdback / 10000 < 0.24, `holdback share ${holdback / 10000}`);
});

test('computePersonalizationResults measures experience vs holdback', () => {
  const px = normalizePersonalization({
    name: 'Ship bar', siteId: 'site1', holdback: 20, goal: 'purchase',
    changes: [{ selector: '.x', type: 'text', value: 'y' }],
  });
  px.id = 'px_t';
  const events = [];
  for (let i = 0; i < 100; i++) events.push({ type: 'personalization', personalizationId: 'px_t', group: 'holdback', visitorId: `h${i}` });
  for (let i = 0; i < 400; i++) events.push({ type: 'personalization', personalizationId: 'px_t', group: 'experience', visitorId: `e${i}` });
  for (let i = 0; i < 4; i++) events.push({ type: 'conversion', goal: 'purchase', value: 50, visitorId: `h${i}` });
  for (let i = 0; i < 40; i++) events.push({ type: 'conversion', goal: 'purchase', value: 50, visitorId: `e${i}` });
  events.push({ type: 'conversion', goal: 'other', visitorId: 'e0' }); // wrong goal ignored

  const r = computePersonalizationResults(px, events);
  const [holdback, experience] = r.arms;
  assert.strictEqual(holdback.visitors, 100);
  assert.strictEqual(holdback.conversions, 4);
  assert.strictEqual(experience.visitors, 400);
  assert.strictEqual(experience.conversions, 40);
  assert.strictEqual(experience.revenue, 2000);
  assert.ok(r.vsHoldback.uplift > 1); // 10% vs 4% → +150%
  assert.ok(r.vsHoldback.pValue < 0.1);
});

// ---------- custom funnels ----------

test('validateFunnel enforces step shape', () => {
  assert.ok(validateFunnel({ name: 'f', steps: [{ label: 'a', type: 'pageview' }] })
    .some((e) => e.includes('2 steps')));
  assert.ok(validateFunnel({ name: 'f', steps: [{ label: 'a', type: 'track' }, { label: 'b', type: 'conversion' }] })
    .some((e) => e.includes('name is required')));
  assert.deepStrictEqual(validateFunnel({
    name: 'f',
    steps: [{ label: 'PDP', type: 'pageview', urlContains: '/products' }, { label: 'Buy', type: 'conversion', goal: 'purchase' }],
  }), []);
});

test('custom funnel stages match pageview urlContains', () => {
  const events = [
    { visitorId: 'a', type: 'pageview', url: 'https://x.com/products/serum' },
    { visitorId: 'b', type: 'pageview', url: 'https://x.com/about' },
    { visitorId: 'a', type: 'conversion', goal: 'purchase' },
  ];
  const stages = [
    { id: 'pdp', label: 'PDP view', type: 'pageview', urlContains: '/products' },
    { id: 'buy', label: 'Purchase', type: 'conversion', goal: 'purchase' },
  ];
  const f = funnelReport(events, stages);
  assert.deepStrictEqual(f.stages.map((s) => s.visitors), [1, 1]);
});

test('filterEventsBySource keeps only visitors from that channel', () => {
  const meta = { source: 'meta', medium: 'cpc', campaign: 'x' };
  const events = [
    { visitorId: 'a', type: 'pageview', lt: meta },
    { visitorId: 'a', type: 'conversion', goal: 'purchase', lt: meta },
    { visitorId: 'b', type: 'pageview', lt: null },
  ];
  const filtered = filterEventsBySource(events, 'meta');
  assert.strictEqual(filtered.length, 2);
  assert.ok(filtered.every((e) => e.visitorId === 'a'));
});
