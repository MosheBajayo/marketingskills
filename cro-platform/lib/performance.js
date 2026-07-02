// Website performance from real-user web vitals collected by the snippet
// ('vital' events: LCP, CLS, INP, TTFB). p75 per page, rated against
// Google's Core Web Vitals thresholds — the numbers that move both SEO
// and conversion rate.
'use strict';

// [good ceiling, needs-improvement ceiling] per metric.
const THRESHOLDS = {
  LCP: [2500, 4000],   // ms
  CLS: [0.1, 0.25],    // unitless
  INP: [200, 500],     // ms
  TTFB: [800, 1800],   // ms
};
const METRICS = Object.keys(THRESHOLDS);

function rating(metric, value) {
  const t = THRESHOLDS[metric];
  if (!t || value == null) return null;
  return value <= t[0] ? 'good' : value <= t[1] ? 'needs-improvement' : 'poor';
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

function pathOf(url) {
  if (!url) return '(unknown)';
  try { return new URL(url).pathname; } catch { return String(url).split('?')[0]; }
}

// Aggregate vital events into per-page and site-wide p75 metrics.
function performanceReport(events) {
  const byPage = new Map();
  const site = {};
  for (const m of METRICS) site[m] = [];

  for (const e of events) {
    if (e.type !== 'vital' || !METRICS.includes(e.name) || typeof e.value !== 'number') continue;
    const page = pathOf(e.url);
    if (!byPage.has(page)) {
      const slot = { page, samples: 0 };
      for (const m of METRICS) slot[m] = [];
      byPage.set(page, slot);
    }
    byPage.get(page)[e.name].push(e.value);
    site[e.name].push(e.value);
  }

  const summarize = (slot) => {
    const out = { page: slot.page, samples: 0 };
    for (const m of METRICS) {
      const values = slot[m].sort((a, b) => a - b);
      out.samples = Math.max(out.samples, values.length);
      const p75 = percentile(values, 0.75);
      out[m] = p75 == null ? null : {
        p75: Math.round(p75 * 1000) / 1000,
        rating: rating(m, p75),
        samples: values.length,
      };
    }
    return out;
  };

  const pages = [...byPage.values()].map(summarize).sort((a, b) => b.samples - a.samples);
  const siteSummary = summarize({ page: '(site)', ...site });
  return { metrics: METRICS, thresholds: THRESHOLDS, site: siteSummary, pages };
}

// Insight helper: pages with meaningful traffic and a poor/needs-improvement LCP.
function slowPages(report, minSamples = 20) {
  return report.pages.filter((p) =>
    p.samples >= minSamples && p.LCP && p.LCP.rating !== 'good');
}

module.exports = { THRESHOLDS, METRICS, rating, performanceReport, slowPages, pathOf };
