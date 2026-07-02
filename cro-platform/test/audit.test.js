'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { analyzeHtml, stripTags } = require('../lib/audit');
const { fromAudit } = require('../lib/recommendations');

const GOOD_PAGE = `<!doctype html><html><head>
  <title>Vitamin C Serum — Brighter Skin in 14 Days</title>
  <meta name="description" content="Best-selling vitamin C serum with 2,000+ five-star reviews. Free shipping and 30-day money-back guarantee.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script type="application/ld+json">{"@type":"Product"}</script>
</head><body>
  <h1>Brighter skin in 14 days</h1>
  <a href="/buy">Add to Cart</a>
  <p>★★★★★ 4.8 from 2,140 verified reviews. Trusted by 50,000 customers.</p>
  <p>Free shipping · 30-day money-back guarantee · Secure checkout</p>
  <p>Limited time: sale ends Sunday.</p>
  <img src="a.jpg" alt="serum bottle">
  <form><input type="email" name="email"><button>Subscribe</button></form>
</body></html>`;

const BAD_PAGE = `<html><head></head><body>
  <h1>Welcome</h1><h1>Second heading</h1>
  <p>We are a company that sells things.</p>
  <img src="a.jpg"><img src="b.jpg">
  <form>${'<input type="text">'.repeat(9)}</form>
</body></html>`;

test('stripTags removes markup and scripts', () => {
  assert.strictEqual(stripTags('<p>Hi <b>there</b></p><script>x()</script>'), 'Hi there');
});

test('good DTC page scores high and passes key checks', () => {
  const r = analyzeHtml(GOOD_PAGE, 'https://example.com');
  assert.ok(r.score >= 85, `score was ${r.score}`);
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c.passed]));
  assert.ok(byId['cta-present']);
  assert.ok(byId['social-proof']);
  assert.ok(byId['trust-signals']);
  assert.ok(byId['h1']);
  assert.ok(byId['viewport']);
  assert.ok(byId['https']);
  assert.ok(byId['email-capture']);
  assert.ok(byId['schema']);
});

test('bad page scores low and reports issues', () => {
  const r = analyzeHtml(BAD_PAGE, 'http://example.com');
  assert.ok(r.score <= 40, `score was ${r.score}`);
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c.passed]));
  assert.strictEqual(byId['h1'], false);           // two h1s
  assert.strictEqual(byId['cta-present'], false);  // no action CTA
  assert.strictEqual(byId['social-proof'], false);
  assert.strictEqual(byId['form-friction'], false); // 9 fields
  assert.strictEqual(byId['https'], false);
  assert.ok(r.topIssues.length === 5);
});

test('checks carry weights and grade maps to score', () => {
  const r = analyzeHtml(GOOD_PAGE, 'https://example.com');
  assert.ok(['A', 'B'].includes(r.grade));
  assert.ok(r.checks.every((c) => c.weight > 0));
});

test('fromAudit maps failed checks to prioritized playbooks', () => {
  const r = analyzeHtml(BAD_PAGE, 'http://example.com');
  const plan = fromAudit(r);
  assert.ok(plan.length > 0);
  // High-impact plays come first.
  const impacts = plan.map((p) => p.impact);
  const firstMedium = impacts.indexOf('medium');
  const lastHigh = impacts.lastIndexOf('high');
  assert.ok(firstMedium === -1 || lastHigh < firstMedium || lastHigh === -1);
  // Every play references a skill directory-style name.
  assert.ok(plan.every((p) => /^[a-z0-9-]+$/.test(p.skill)));
});
