// Statistics for A/B experiment evaluation. Zero dependencies.
// Two-proportion z-test, confidence intervals, and sample-ratio-mismatch check.
'use strict';

// Abramowitz & Stegun 7.1.26 approximation of erf, max error ~1.5e-7.
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return sign * y;
}

// Standard normal cumulative distribution function.
function normalCdf(z) {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// Two-proportion z-test. Returns null when either arm lacks traffic.
// a/b: { visitors, conversions }
function twoProportionTest(a, b) {
  if (!a.visitors || !b.visitors) return null;
  const pA = a.conversions / a.visitors;
  const pB = b.conversions / b.visitors;
  const pooled = (a.conversions + b.conversions) / (a.visitors + b.visitors);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / a.visitors + 1 / b.visitors));
  if (se === 0) {
    return { z: 0, pValue: 1, significant: false, uplift: 0, rateA: pA, rateB: pB };
  }
  const z = (pB - pA) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  const uplift = pA > 0 ? (pB - pA) / pA : null;
  return {
    z: round(z, 4),
    pValue: round(pValue, 6),
    significant: pValue < 0.05,
    confidence: round((1 - pValue) * 100, 2),
    uplift: uplift === null ? null : round(uplift, 6),
    rateA: round(pA, 6),
    rateB: round(pB, 6),
  };
}

// Wilson score interval for a single conversion rate (95%).
function wilsonInterval(conversions, visitors) {
  if (!visitors) return { low: 0, high: 0 };
  const z = 1.96;
  const p = conversions / visitors;
  const denom = 1 + (z * z) / visitors;
  const center = p + (z * z) / (2 * visitors);
  const spread = z * Math.sqrt((p * (1 - p)) / visitors + (z * z) / (4 * visitors * visitors));
  return {
    low: round(Math.max(0, (center - spread) / denom), 6),
    high: round(Math.min(1, (center + spread) / denom), 6),
  };
}

// Sample-ratio-mismatch check across variant visitor counts vs expected weights.
// Chi-square goodness of fit; flags when p < 0.001 (industry-standard SRM alarm).
function srmCheck(observed, weights) {
  const total = observed.reduce((s, n) => s + n, 0);
  if (total < 100) return { srm: false, pValue: 1, checked: false };
  const wTotal = weights.reduce((s, w) => s + w, 0);
  let chi = 0;
  for (let i = 0; i < observed.length; i++) {
    const expected = (total * weights[i]) / wTotal;
    if (expected === 0) continue;
    chi += ((observed[i] - expected) ** 2) / expected;
  }
  const dof = observed.length - 1;
  const pValue = chiSquarePValue(chi, dof);
  return { srm: pValue < 0.001, pValue: round(pValue, 6), checked: true, chiSquare: round(chi, 4) };
}

// Upper-tail chi-square p-value via the regularized upper incomplete gamma
// function Q(k/2, x/2), computed with a series/continued-fraction split.
function chiSquarePValue(x, k) {
  if (x <= 0 || k <= 0) return 1;
  return upperGammaRegularized(k / 2, x / 2);
}

function upperGammaRegularized(s, x) {
  if (x < s + 1) return 1 - lowerGammaSeries(s, x);
  return upperGammaContinuedFraction(s, x);
}

function lowerGammaSeries(s, x) {
  let sum = 1 / s;
  let term = sum;
  for (let n = 1; n < 200; n++) {
    term *= x / (s + n);
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * 1e-12) break;
  }
  return sum * Math.exp(-x + s * Math.log(x) - logGamma(s));
}

function upperGammaContinuedFraction(s, x) {
  let b = x + 1 - s;
  let c = 1e308;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 200; i++) {
    const an = -i * (i - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return h * Math.exp(-x + s * Math.log(x) - logGamma(s));
}

// Lanczos approximation.
function logGamma(z) {
  const g = 7;
  const coef = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = coef[0];
  for (let i = 1; i < g + 2; i++) x += coef[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// Minimum sample size per variant for a two-proportion test
// (alpha 0.05 two-sided, power 0.8) given a baseline rate and
// minimum detectable relative effect.
function requiredSampleSize(baselineRate, minRelativeEffect) {
  if (baselineRate <= 0 || baselineRate >= 1 || minRelativeEffect <= 0) return null;
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minRelativeEffect);
  if (p2 >= 1) return null;
  const zAlpha = 1.959963985; // z(0.975)
  const zBeta = 0.841621234; // z(0.8)
  const pBar = (p1 + p2) / 2;
  const numerator =
    zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
  const n = (numerator ** 2) / ((p2 - p1) ** 2);
  return Math.ceil(n);
}

function round(n, places) {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

module.exports = {
  erf,
  normalCdf,
  twoProportionTest,
  wilsonInterval,
  srmCheck,
  chiSquarePValue,
  requiredSampleSize,
};
