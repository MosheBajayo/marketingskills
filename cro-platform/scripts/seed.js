#!/usr/bin/env node
// Seed demo data: a demo DTC brand, a running hero-headline experiment with
// realistic traffic (significant winner), a fresh experiment, and an audit
// of the bundled demo storefront page.
//
//   node scripts/seed.js
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Store } = require('../lib/store');
const { analyzeHtml } = require('../lib/audit');
const recommendations = require('../lib/recommendations');
const { assignVariant } = require('../lib/experiments');
const { matchedSegmentIds } = require('../lib/segments');
const { assignGroup } = require('../lib/personalization');

const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'db.json');
const store = new Store(DATA_FILE);

if (store.get('sites', 'site_demo')) {
  console.log('Demo data already present — nothing to do. Delete data/db.json to reseed.');
  process.exit(0);
}

const now = Date.now();
const iso = (msAgo) => new Date(now - msAgo).toISOString();

// --- Site ---
store.data.sites.push({
  id: 'site_demo',
  name: 'Glow Ritual (demo)',
  url: 'http://localhost:4600/demo.html',
  platform: 'shopify',
  createdAt: iso(21 * 86400e3),
});

// --- Experiment 1: running, with data showing a significant winner ---
const expHero = {
  id: 'exp_demo_hero',
  siteId: 'site_demo',
  name: 'Hero headline test',
  goal: 'purchase',
  hypothesis: 'An outcome-focused headline ("brighter skin in 14 days") beats the product-name headline.',
  url: '/demo.html',
  status: 'running',
  startedAt: iso(14 * 86400e3),
  createdAt: iso(15 * 86400e3),
  variants: [
    { id: 'v0', name: 'Control', weight: 1, changes: [] },
    {
      id: 'v1', name: 'Outcome headline', weight: 1,
      changes: [{ selector: '.hero-title', type: 'text', value: 'Brighter, Glowing Skin in 14 Days — Guaranteed' }],
    },
  ],
};
store.data.experiments.push(expHero);

// --- Experiment 2: freshly created draft ---
store.data.experiments.push({
  id: 'exp_demo_shipping',
  siteId: 'site_demo',
  name: 'Free-shipping threshold banner',
  goal: 'purchase',
  hypothesis: 'Showing "Free shipping over $40" in the header lifts add-to-cart rate.',
  url: '',
  status: 'draft',
  createdAt: iso(1 * 86400e3),
  variants: [
    { id: 'v0', name: 'Control', weight: 1, changes: [] },
    { id: 'v1', name: 'Shipping banner', weight: 1, changes: [{ selector: 'header', type: 'style', value: 'border-bottom: 3px solid #d99a2b' }] },
  ],
});

// --- Segments (audiences) ---
const SEGMENTS = [
  {
    id: 'seg_mobile', name: 'Mobile visitors', siteId: 'site_demo',
    description: 'Visitors on mobile devices',
    rules: [{ attr: 'device', op: 'is', value: 'mobile' }],
    createdAt: iso(10 * 86400e3),
  },
  {
    id: 'seg_meta_paid', name: 'Meta paid traffic', siteId: 'site_demo',
    description: 'Visitors arriving from Meta ads',
    rules: [{ attr: 'source', op: 'is', value: 'meta' }, { attr: 'medium', op: 'is', value: 'cpc' }],
    createdAt: iso(10 * 86400e3),
  },
  {
    id: 'seg_returning', name: 'Returning visitors', siteId: 'site_demo',
    description: 'Visitors with more than one session',
    rules: [{ attr: 'returning', op: 'is', value: 'true' }],
    createdAt: iso(10 * 86400e3),
  },
];
store.data.segments.push(...SEGMENTS);

// --- Personalization: shipping reassurance for Meta paid traffic, 20% holdback ---
const pxShipping = {
  id: 'px_demo_shipping',
  name: 'Shipping reassurance bar for Meta traffic',
  siteId: 'site_demo',
  segmentId: 'seg_meta_paid',
  goal: 'purchase',
  url: '',
  holdback: 20,
  status: 'running',
  startedAt: iso(9 * 86400e3),
  createdAt: iso(10 * 86400e3),
  changes: [{ selector: '.shipping', type: 'style', value: 'font-weight:700; color:#8a5a00; font-size:15px' }],
};
store.data.personalizations.push(pxShipping);

// --- Custom funnel (Superfunnel-style) ---
store.data.funnels.push({
  id: 'fn_demo_cart',
  name: 'Cart-to-purchase funnel',
  siteId: 'site_demo',
  steps: [
    { id: 's0', label: 'Added to cart', type: 'track', name: 'add_to_cart' },
    { id: 's1', label: 'Began checkout', type: 'track', name: 'begin_checkout' },
    { id: 's2', label: 'Purchased', type: 'conversion', goal: 'purchase' },
  ],
  createdAt: iso(8 * 86400e3),
});

// --- Ad campaigns (spend entries, matching the UTMs on seeded traffic) ---
const CHANNELS = [
  { share: 0.28, mult: 0.85, touch: { source: 'meta', medium: 'cpc', campaign: 'prospecting-broad', referrer: 'https://facebook.com/', landing: '/demo.html' } },
  { share: 0.10, mult: 1.9, touch: { source: 'meta', medium: 'cpc', campaign: 'retargeting-30d', referrer: 'https://facebook.com/', landing: '/demo.html' } },
  { share: 0.13, mult: 1.7, touch: { source: 'google', medium: 'cpc', campaign: 'brand-search', referrer: 'https://google.com/', landing: '/demo.html' } },
  { share: 0.12, mult: 1.4, touch: { source: 'klaviyo', medium: 'email', campaign: 'welcome-flow', referrer: '', landing: '/demo.html' } },
  { share: 0.17, mult: 1.0, touch: { referrer: 'https://www.google.com/', landing: '/demo.html' } }, // organic
  { share: 0.20, mult: 1.1, touch: null }, // direct / untagged
];

store.data.campaigns.push(
  {
    id: 'cmp_meta_prospecting', name: 'Meta prospecting broad', siteId: 'site_demo', channel: 'Meta Ads',
    utmSource: 'meta', utmMedium: 'cpc', utmCampaign: 'prospecting-broad',
    spend: 1800, clicks: 1150, impressions: 152000, period: 'last 14 days', createdAt: iso(86400e3),
  },
  {
    id: 'cmp_meta_retargeting', name: 'Meta retargeting 30d', siteId: 'site_demo', channel: 'Meta Ads',
    utmSource: 'meta', utmMedium: 'cpc', utmCampaign: 'retargeting-30d',
    spend: 600, clicks: 480, impressions: 21000, period: 'last 14 days', createdAt: iso(86400e3),
  },
  {
    id: 'cmp_google_brand', name: 'Google brand search', siteId: 'site_demo', channel: 'Google Ads',
    utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'brand-search',
    spend: 400, clicks: 520, impressions: 9500, period: 'last 14 days', createdAt: iso(86400e3),
  },
  {
    id: 'cmp_tiktok_test', name: 'TikTok spark test', siteId: 'site_demo', channel: 'TikTok Ads',
    utmSource: 'tiktok', utmMedium: 'cpc', utmCampaign: 'spark-test',
    spend: 250, clicks: 300, impressions: 60000, period: 'last 14 days', createdAt: iso(86400e3),
  } // note: no traffic seeded for this one → surfaces a "spend, zero visitors" insight
);

// --- Events ---
// Deterministic simulation: bucket each visitor with the real assignment
// function. Purchase probability = variant base rate × channel multiplier.
// Funnel: everyone views; a share adds to cart; a share of those checks out;
// buyers complete all steps and convert with revenue.
const RATES = { v0: 0.045, v1: 0.065 };
const VISITORS = 2600;
let eventId = 0;
const pushEvent = (e, msAgo) => {
  store.data.events.push({ id: `evt_seed_${eventId++}`, createdAt: iso(msAgo), ...e });
};

// Deterministic pseudo-random from visitor index so reseeding is reproducible.
function pseudoRandom(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function pickChannel(i) {
  const r = pseudoRandom(i + 5000);
  let acc = 0;
  for (const c of CHANNELS) {
    acc += c.share;
    if (r < acc) return c;
  }
  return CHANNELS[CHANNELS.length - 1];
}

for (let i = 0; i < VISITORS; i++) {
  const visitorId = `v_demo_${i.toString(36)}`;
  const variant = assignVariant(expHero, visitorId);
  const channel = pickChannel(i);
  const ft = channel.touch;
  const lt = channel.touch;
  const msAgo = Math.floor(pseudoRandom(i + 9000) * 13 * 86400e3); // spread over 13 days

  // Visitor attributes → matched segments (same rules the snippet evaluates).
  const attrs = {
    device: pseudoRandom(i + 4000) < 0.58 ? 'mobile' : 'desktop',
    returning: pseudoRandom(i + 6000) < 0.28,
    visits: pseudoRandom(i + 6000) < 0.28 ? 2 : 1,
    source: (lt && lt.source) || '',
    medium: (lt && lt.medium) || '',
    campaign: (lt && lt.campaign) || '',
    referrer: (lt && lt.referrer) || '',
    path: '/demo.html',
  };
  const segs = matchedSegmentIds(SEGMENTS, attrs);
  const base = {
    siteId: 'site_demo', visitorId, experimentId: null, variantId: null,
    goal: null, url: '/demo.html', ft, lt, segments: segs,
  };

  pushEvent({ ...base, type: 'pageview' }, msAgo);
  pushEvent({ ...base, type: 'assignment', experimentId: expHero.id, variantId: variant.id }, msAgo);

  // Personalization impression for its audience; the experience arm
  // converts a bit better than the holdback control.
  let pxMult = 1;
  if (segs.includes('seg_meta_paid')) {
    const group = assignGroup(pxShipping, visitorId);
    pxMult = group === 'experience' ? 1.35 : 1;
    pushEvent({ ...base, type: 'personalization', personalizationId: pxShipping.id, group }, msAgo);
  }

  const buys = pseudoRandom(i) < RATES[variant.id] * channel.mult * pxMult;
  const addsToCart = buys || pseudoRandom(i + 1000) < 0.22;
  const checksOut = buys || (addsToCart && pseudoRandom(i + 2000) < 0.30);

  if (addsToCart) pushEvent({ ...base, type: 'track', name: 'add_to_cart' }, msAgo - 90e3);
  if (checksOut) pushEvent({ ...base, type: 'track', name: 'begin_checkout' }, msAgo - 60e3);
  if (buys) {
    const value = pseudoRandom(i + 3000) < 0.2 ? 96 : 48; // 20% buy two units
    pushEvent({
      ...base, type: 'conversion', experimentId: expHero.id, variantId: variant.id,
      goal: 'purchase', value,
    }, msAgo - 30e3);
  }
}

// --- Audit of the bundled demo page ---
const demoHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'demo.html'), 'utf8');
const report = analyzeHtml(demoHtml, 'http://localhost:4600/demo.html');
store.data.audits.push({
  id: 'aud_demo',
  url: 'http://localhost:4600/demo.html',
  finalUrl: 'http://localhost:4600/demo.html',
  siteId: 'site_demo',
  status: 200,
  ok: true,
  report,
  plan: recommendations.fromAudit(report),
  createdAt: iso(2 * 86400e3),
});

store.save();

const assignments = store.data.events.filter((e) => e.type === 'assignment');
const conversions = store.data.events.filter((e) => e.type === 'conversion');
const revenue = conversions.reduce((s, e) => s + (e.value || 0), 0);
const spend = store.data.campaigns.reduce((s, c) => s + c.spend, 0);
console.log('Seeded demo data:');
console.log(`  1 site (site_demo), 2 experiments, ${store.data.events.length} events`);
console.log(`  ${store.data.segments.length} segments, 1 personalization (20% holdback), 1 custom funnel`);
console.log(`  ${assignments.length} assignments, ${conversions.length} conversions, $${revenue} revenue`);
console.log(`  ${store.data.campaigns.length} ad campaigns, $${spend} spend (blended ROAS ${(revenue / spend).toFixed(2)}x)`);
console.log(`  1 audit of the demo store (score ${report.score}/100, grade ${report.grade})`);
console.log('\nStart the server with `npm start`, then open:');
console.log('  Dashboard:  http://localhost:4600/');
console.log('  Demo store: http://localhost:4600/demo.html');
