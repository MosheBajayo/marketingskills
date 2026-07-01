// End-to-end API test: boots the real server on an ephemeral port with a
// temp data file and walks the core product flow:
// site → experiment → start → snippet config → collect events → results.
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');

const tmpData = path.join(os.tmpdir(), `cro-test-${process.pid}-${Date.now()}.json`);
process.env.DATA_FILE = tmpData;
const { server } = require('../server');

let base;

test.before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tmpData, { force: true });
});

async function call(method, urlPath, body) {
  const res = await fetch(base + urlPath, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

test('full product flow', async (t) => {
  let siteId, expId;

  await t.test('health check', async () => {
    const r = await call('GET', '/api/health');
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.ok, true);
  });

  await t.test('create site', async () => {
    const r = await call('POST', '/api/sites', { name: 'Test Brand', url: 'https://test.com', platform: 'shopify' });
    assert.strictEqual(r.status, 201);
    siteId = r.body.id;
    assert.ok(siteId);
  });

  await t.test('reject invalid experiment', async () => {
    const r = await call('POST', '/api/experiments', { name: 'x' });
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.errors.length);
  });

  await t.test('create and start experiment', async () => {
    const r = await call('POST', '/api/experiments', {
      name: 'Headline test', siteId, goal: 'purchase',
      variants: [{ name: 'Control' }, { name: 'B', changes: [{ selector: 'h1', type: 'text', value: 'New' }] }],
    });
    assert.strictEqual(r.status, 201);
    expId = r.body.id;
    assert.strictEqual(r.body.status, 'draft');

    const started = await call('POST', `/api/experiments/${expId}/status`, { status: 'running' });
    assert.strictEqual(started.body.status, 'running');
  });

  await t.test('snippet config exposes only running experiments for the site', async () => {
    const r = await call('GET', `/t/config?site=${siteId}`);
    assert.strictEqual(r.body.experiments.length, 1);
    assert.strictEqual(r.body.experiments[0].id, expId);
    const other = await call('GET', '/t/config?site=nope');
    assert.strictEqual(other.body.experiments.length, 0);
  });

  await t.test('collect events and compute results', async () => {
    // 40 visitors on v0 (4 convert), 40 on v1 (8 convert).
    const events = [];
    for (let i = 0; i < 40; i++) {
      events.push({ type: 'assignment', siteId, visitorId: `a${i}`, experimentId: expId, variantId: 'v0' });
      events.push({ type: 'assignment', siteId, visitorId: `b${i}`, experimentId: expId, variantId: 'v1' });
      if (i < 4) events.push({ type: 'conversion', siteId, visitorId: `a${i}`, experimentId: expId, variantId: 'v0', goal: 'purchase' });
      if (i < 8) events.push({ type: 'conversion', siteId, visitorId: `b${i}`, experimentId: expId, variantId: 'v1', goal: 'purchase' });
    }
    // Batched sends of ≤50.
    for (let i = 0; i < events.length; i += 50) {
      const r = await call('POST', '/t/collect', { events: events.slice(i, i + 50) });
      assert.strictEqual(r.status, 200);
    }

    const results = await call('GET', `/api/experiments/${expId}/results`);
    const [v0, v1] = results.body.variants;
    assert.strictEqual(v0.visitors, 40);
    assert.strictEqual(v0.conversions, 4);
    assert.strictEqual(v1.visitors, 40);
    assert.strictEqual(v1.conversions, 8);
    assert.ok(results.body.comparisons[0].vsControl.pValue > 0); // computed
  });

  await t.test('collect rejects junk events', async () => {
    const r = await call('POST', '/t/collect', { events: [{ type: 'evil' }, { nope: 1 }] });
    assert.strictEqual(r.body.accepted, 0);
  });

  await t.test('audit with inline html', async () => {
    const r = await call('POST', '/api/audits', {
      html: '<html><head><title>A decent product page title</title></head><body><h1>Value</h1><a href="#">Add to Cart</a></body></html>',
      siteId,
    });
    assert.strictEqual(r.status, 201);
    assert.ok(r.body.report.score > 0);
    assert.ok(Array.isArray(r.body.plan));
  });

  await t.test('snippet is served with site id embedded', async () => {
    const res = await fetch(`${base}/t/snippet.js?site=${siteId}`);
    const js = await res.text();
    assert.ok(res.headers.get('content-type').includes('javascript'));
    assert.ok(js.includes(JSON.stringify(siteId)));
    assert.ok(!js.includes('__SITE_ID__'));
  });

  await t.test('overview aggregates', async () => {
    const r = await call('GET', '/api/overview');
    assert.strictEqual(r.body.sites, 1);
    assert.strictEqual(r.body.experiments, 1);
    assert.ok(r.body.events > 0);
  });

  await t.test('collect accepts funnel + revenue + attribution fields', async () => {
    const touch = { source: 'meta', medium: 'cpc', campaign: 'pros', referrer: 'https://facebook.com/', junk: 'dropme' };
    const r = await call('POST', '/t/collect', {
      events: [
        { type: 'pageview', siteId, visitorId: 'attr1', ft: touch, lt: touch },
        { type: 'track', siteId, visitorId: 'attr1', name: 'add_to_cart', ft: touch, lt: touch },
        { type: 'track', siteId, visitorId: 'attr1' }, // track without name → rejected
        { type: 'conversion', siteId, visitorId: 'attr1', goal: 'purchase', value: 48, ft: touch, lt: touch },
      ],
    });
    assert.strictEqual(r.body.accepted, 3);
  });

  await t.test('campaigns CRUD and validation', async () => {
    const bad = await call('POST', '/api/campaigns', { name: 'x' });
    assert.strictEqual(bad.status, 400);
    const r = await call('POST', '/api/campaigns', {
      name: 'Meta prospecting', utmSource: 'META', utmMedium: 'cpc', utmCampaign: 'pros',
      spend: 96, clicks: 100, impressions: 10000, siteId,
    });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.utmSource, 'meta'); // normalized lowercase
    const list = await call('GET', '/api/campaigns');
    assert.strictEqual(list.body.length, 1);
  });

  await t.test('channels report attributes traffic and matches spend', async () => {
    const r = await call('GET', `/api/channels?siteId=${siteId}`);
    const meta = r.body.rows.find((x) => x.source === 'meta');
    assert.ok(meta, 'meta channel row exists');
    assert.strictEqual(meta.visitors, 1);
    assert.strictEqual(meta.conversions, 1);
    assert.strictEqual(meta.revenue, 48);
    assert.strictEqual(meta.spend, 96);
    assert.strictEqual(meta.roas, 0.5);
    // the earlier unattributed test traffic lands in direct
    assert.ok(r.body.rows.find((x) => x.source === 'direct'));
    const first = await call('GET', `/api/channels?siteId=${siteId}&model=first`);
    assert.strictEqual(first.body.model, 'first');
  });

  await t.test('funnel report tracks stages', async () => {
    const r = await call('GET', `/api/funnel?siteId=${siteId}`);
    const byId = Object.fromEntries(r.body.stages.map((s) => [s.id, s.visitors]));
    assert.ok(byId.visit >= 1);
    assert.strictEqual(byId.add_to_cart, 1);
    assert.ok(byId.purchase >= 1);
  });

  await t.test('insights cross-reference spend, funnel, and experiments', async () => {
    const r = await call('GET', '/api/insights');
    assert.strictEqual(r.status, 200);
    assert.ok(Array.isArray(r.body.insights));
    // meta ROAS is 0.5 with only $96 spend (< $100 threshold) so no loser flag,
    // but the blended-picture info insight must exist since spend > 0.
    assert.ok(r.body.insights.some((i) => i.title.includes('Blended performance')));
    assert.ok(r.body.insights.every((i) => ['bad', 'warn', 'good', 'info'].includes(i.severity)));
  });

  await t.test('overview includes revenue, spend, roas', async () => {
    const r = await call('GET', '/api/overview');
    assert.strictEqual(r.body.revenue, 48);
    assert.strictEqual(r.body.spend, 96);
    assert.strictEqual(r.body.roas, 0.5);
  });

  await t.test('playbooks endpoint filters by category', async () => {
    const all = await call('GET', '/api/playbooks');
    assert.ok(all.body.playbooks.length >= 10);
    const checkout = await call('GET', '/api/playbooks?category=checkout');
    assert.ok(checkout.body.playbooks.every((p) => p.category === 'checkout'));
  });

  await t.test('dashboard is served', async () => {
    const res = await fetch(`${base}/`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('CRO Platform'));
  });
});
