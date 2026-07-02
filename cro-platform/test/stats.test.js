'use strict';
const test = require('node:test');
const assert = require('node:assert');
const {
  erf, normalCdf, twoProportionTest, wilsonInterval, srmCheck,
  chiSquarePValue, requiredSampleSize,
} = require('../lib/stats');

test('erf approximation matches known values', () => {
  assert.ok(Math.abs(erf(0)) < 1e-7);
  assert.ok(Math.abs(erf(1) - 0.8427008) < 1e-5);
  assert.ok(Math.abs(erf(-1) + 0.8427008) < 1e-5);
});

test('normalCdf matches known values', () => {
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-7);
  assert.ok(Math.abs(normalCdf(1.96) - 0.975) < 1e-4);
  assert.ok(Math.abs(normalCdf(-1.96) - 0.025) < 1e-4);
});

test('twoProportionTest detects a clear winner', () => {
  const r = twoProportionTest(
    { visitors: 5000, conversions: 200 },  // 4%
    { visitors: 5000, conversions: 300 }   // 6%
  );
  assert.ok(r.significant);
  assert.ok(r.pValue < 0.001);
  assert.ok(r.z > 4);
  assert.ok(Math.abs(r.uplift - 0.5) < 1e-9); // +50% relative
});

test('twoProportionTest does not flag noise', () => {
  const r = twoProportionTest(
    { visitors: 100, conversions: 5 },
    { visitors: 100, conversions: 6 }
  );
  assert.ok(!r.significant);
  assert.ok(r.pValue > 0.05);
});

test('twoProportionTest handles empty arms', () => {
  assert.strictEqual(twoProportionTest({ visitors: 0, conversions: 0 }, { visitors: 10, conversions: 1 }), null);
});

test('twoProportionTest handles zero conversions in both arms', () => {
  const r = twoProportionTest({ visitors: 50, conversions: 0 }, { visitors: 50, conversions: 0 });
  assert.strictEqual(r.significant, false);
});

test('wilsonInterval brackets the point estimate', () => {
  const { low, high } = wilsonInterval(50, 1000);
  assert.ok(low < 0.05 && high > 0.05);
  assert.ok(low > 0.03 && high < 0.07);
});

test('wilsonInterval handles zero visitors', () => {
  assert.deepStrictEqual(wilsonInterval(0, 0), { low: 0, high: 0 });
});

test('chiSquarePValue matches known values', () => {
  // chi2=3.841, dof=1 → p ≈ 0.05
  assert.ok(Math.abs(chiSquarePValue(3.841, 1) - 0.05) < 0.001);
  // chi2=0 → p = 1
  assert.strictEqual(chiSquarePValue(0, 1), 1);
});

test('srmCheck passes balanced traffic', () => {
  const r = srmCheck([5000, 5010], [1, 1]);
  assert.strictEqual(r.srm, false);
  assert.strictEqual(r.checked, true);
});

test('srmCheck flags a broken split', () => {
  const r = srmCheck([5000, 4000], [1, 1]);
  assert.strictEqual(r.srm, true);
  assert.ok(r.pValue < 0.001);
});

test('srmCheck skips low-traffic experiments', () => {
  const r = srmCheck([10, 4], [1, 1]);
  assert.strictEqual(r.checked, false);
  assert.strictEqual(r.srm, false);
});

test('requiredSampleSize gives sane magnitudes', () => {
  const n = requiredSampleSize(0.03, 0.15); // 3% baseline, detect +15% relative
  assert.ok(n > 10000 && n < 100000, `got ${n}`);
  assert.strictEqual(requiredSampleSize(0, 0.15), null);
});
