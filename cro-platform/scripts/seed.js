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

// --- Events for experiment 1 ---
// Deterministic simulation: bucket each visitor with the real assignment
// function, convert control at ~4.5% and the variant at ~6.5%.
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

for (let i = 0; i < VISITORS; i++) {
  const visitorId = `v_demo_${i.toString(36)}`;
  const variant = assignVariant(expHero, visitorId);
  const msAgo = Math.floor(pseudoRandom(i + 9000) * 13 * 86400e3); // spread over 13 days
  pushEvent({ type: 'pageview', siteId: 'site_demo', visitorId, experimentId: null, variantId: null, goal: null, url: '/demo.html' }, msAgo);
  pushEvent({ type: 'assignment', siteId: 'site_demo', visitorId, experimentId: expHero.id, variantId: variant.id, goal: null, url: '/demo.html' }, msAgo);
  if (pseudoRandom(i) < RATES[variant.id]) {
    pushEvent({ type: 'conversion', siteId: 'site_demo', visitorId, experimentId: expHero.id, variantId: variant.id, goal: 'purchase', url: '/demo.html' }, msAgo - 60e3);
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
console.log('Seeded demo data:');
console.log(`  1 site (site_demo), 2 experiments, ${store.data.events.length} events`);
console.log(`  ${assignments.length} assignments, ${conversions.length} conversions`);
console.log(`  1 audit of the demo store (score ${report.score}/100, grade ${report.grade})`);
console.log('\nStart the server with `npm start`, then open:');
console.log('  Dashboard:  http://localhost:4600/');
console.log('  Demo store: http://localhost:4600/demo.html');
