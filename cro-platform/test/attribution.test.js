'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { deriveChannel, channelReport, funnelReport } = require('../lib/attribution');
const { generateInsights } = require('../lib/insights');

test('deriveChannel classifies utm, search, social, referral, direct', () => {
  assert.deepStrictEqual(
    deriveChannel({ source: 'Meta', medium: 'CPC', campaign: 'Prospecting' }),
    { source: 'meta', medium: 'cpc', campaign: 'prospecting' });
  assert.deepStrictEqual(
    deriveChannel({ referrer: 'https://www.google.com/search?q=x' }),
    { source: 'google', medium: 'organic', campaign: '(none)' });
  assert.strictEqual(deriveChannel({ referrer: 'https://facebook.com/' }).medium, 'social');
  assert.strictEqual(deriveChannel({ referrer: 'https://someblog.com/post' }).medium, 'referral');
  assert.deepStrictEqual(deriveChannel(null), { source: 'direct', medium: '(none)', campaign: '(none)' });
});

const META = { source: 'meta', medium: 'cpc', campaign: 'pros' };
function ev(visitorId, type, extra = {}) {
  return { visitorId, type, lt: META, ft: META, ...extra };
}

test('channelReport computes CVR, revenue, ROAS, CPA per channel', () => {
  const events = [
    ev('a', 'pageview'), ev('b', 'pageview'), ev('c', 'pageview'), ev('d', 'pageview'),
    ev('a', 'conversion', { goal: 'purchase', value: 50 }),
    ev('b', 'conversion', { goal: 'purchase', value: 100 }),
    { visitorId: 'z', type: 'pageview', lt: null, ft: null }, // direct
  ];
  const campaigns = [{ utmSource: 'meta', utmMedium: 'cpc', utmCampaign: 'pros', spend: 75, clicks: 100, impressions: 10000 }];
  const report = channelReport(events, campaigns, 'last');

  const meta = report.rows.find((r) => r.source === 'meta');
  assert.strictEqual(meta.visitors, 4);
  assert.strictEqual(meta.conversions, 2);
  assert.strictEqual(meta.cvr, 0.5);
  assert.strictEqual(meta.revenue, 150);
  assert.strictEqual(meta.roas, 2);
  assert.strictEqual(meta.cpa, 37.5);
  assert.strictEqual(meta.cpc, 0.75);
  assert.strictEqual(meta.ctr, 0.01);

  const direct = report.rows.find((r) => r.source === 'direct');
  assert.strictEqual(direct.visitors, 1);
  assert.strictEqual(report.totals.visitors, 5);
  assert.strictEqual(report.totals.revenue, 150);
});

test('channelReport surfaces spend with no matching traffic', () => {
  const report = channelReport([], [{ utmSource: 'tiktok', utmMedium: 'cpc', utmCampaign: 'test', spend: 200 }]);
  const row = report.rows.find((r) => r.source === 'tiktok');
  assert.strictEqual(row.visitors, 0);
  assert.strictEqual(row.spend, 200);
  assert.strictEqual(row.hasSpend, true);
});

test('first-touch vs last-touch attribution differ per model', () => {
  const google = { source: 'google', medium: 'cpc', campaign: 'brand' };
  const events = [
    { visitorId: 'a', type: 'pageview', ft: META, lt: META },
    { visitorId: 'a', type: 'pageview', ft: META, lt: google }, // returns via google
    { visitorId: 'a', type: 'conversion', goal: 'purchase', value: 40, ft: META, lt: google },
  ];
  const last = channelReport(events, [], 'last');
  const first = channelReport(events, [], 'first');
  assert.strictEqual(last.rows.find((r) => r.source === 'google').conversions, 1);
  assert.strictEqual(first.rows.find((r) => r.source === 'meta').conversions, 1);
});

test('funnelReport counts unique visitors per stage with drop-off', () => {
  const events = [];
  for (let i = 0; i < 100; i++) events.push({ visitorId: `v${i}`, type: 'pageview' });
  for (let i = 0; i < 40; i++) events.push({ visitorId: `v${i}`, type: 'track', name: 'add_to_cart' });
  for (let i = 0; i < 20; i++) events.push({ visitorId: `v${i}`, type: 'track', name: 'begin_checkout' });
  for (let i = 0; i < 10; i++) events.push({ visitorId: `v${i}`, type: 'conversion', goal: 'purchase' });
  const f = funnelReport(events);
  assert.deepStrictEqual(f.stages.map((s) => s.visitors), [100, 40, 20, 10]);
  assert.strictEqual(f.stages[1].stepRate, 0.4);
  assert.strictEqual(f.stages[3].overallRate, 0.1);
  assert.ok(f.leak); // biggest relative loss: visit → add_to_cart (60%)
  assert.strictEqual(f.leak.to, 'add_to_cart');
});

test('generateInsights flags losers, scalers, untracked spend, and funnel leaks', () => {
  const events = [];
  // 200 meta visitors, 20 convert at $50 → revenue 1000
  for (let i = 0; i < 200; i++) events.push(ev(`m${i}`, 'pageview'));
  for (let i = 0; i < 20; i++) events.push(ev(`m${i}`, 'conversion', { goal: 'purchase', value: 50 }));
  // heavy direct traffic → untagged warning
  for (let i = 0; i < 300; i++) events.push({ visitorId: `d${i}`, type: 'pageview', ft: null, lt: null });
  const campaigns = [
    { utmSource: 'meta', utmMedium: 'cpc', utmCampaign: 'pros', spend: 2000 },  // ROAS 0.5 → bad
    { utmSource: 'tiktok', utmMedium: 'cpc', utmCampaign: 'ghost', spend: 300 }, // no traffic → bad
  ];
  const channels = channelReport(events, campaigns, 'last');
  const insights = generateInsights({ channels, funnel: funnelReport(events), campaigns, experiments: [] });

  assert.ok(insights.some((i) => i.severity === 'bad' && i.title.includes('Losing money')));
  assert.ok(insights.some((i) => i.severity === 'bad' && i.title.includes('zero tracked visitors')));
  assert.ok(insights.some((i) => i.title.includes('untagged')));
  // severity ordering: bad first
  assert.strictEqual(insights[0].severity, 'bad');
});

test('generateInsights celebrates a significant experiment winner', () => {
  const experiments = [{ id: 'e1', name: 'Hero test', status: 'running' }];
  const results = new Map([['e1', {
    srm: { srm: false },
    variants: [{ id: 'v0', name: 'Control' }, { id: 'v1', name: 'Winner' }],
    comparisons: [{ variantId: 'v1', vsControl: { significant: true, uplift: 0.4, pValue: 0.01 } }],
  }]]);
  const insights = generateInsights({
    channels: { rows: [], totals: { visitors: 0, conversions: 0, revenue: 0, spend: 0 } },
    funnel: null, experiments, experimentResults: results,
  });
  assert.ok(insights.some((i) => i.severity === 'good' && i.title.includes('significant winner')));
});
