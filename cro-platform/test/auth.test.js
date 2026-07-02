'use strict';
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const auth = require('../lib/auth');
const { buildJwt, parseConnection, flattenReport } = require('../lib/ga4');
const { performanceReport, slowPages, rating } = require('../lib/performance');

// ---------- passwords & sessions ----------

test('hashPassword/verifyPassword round-trip and reject wrong password', () => {
  const stored = auth.hashPassword('correct horse battery');
  assert.ok(stored.startsWith('scrypt$'));
  assert.strictEqual(auth.verifyPassword('correct horse battery', stored), true);
  assert.strictEqual(auth.verifyPassword('wrong', stored), false);
  assert.strictEqual(auth.verifyPassword('x', 'garbage'), false);
});

test('sessions verify, reject tampering, and expire', () => {
  const secret = 'test-secret';
  const token = auth.createSession('usr_1', secret);
  assert.strictEqual(auth.verifySession(token, secret), 'usr_1');
  assert.strictEqual(auth.verifySession(token + 'x', secret), null);
  assert.strictEqual(auth.verifySession(token, 'other-secret'), null);
  const expired = auth.createSession('usr_1', secret, -1000);
  assert.strictEqual(auth.verifySession(expired, secret), null);
});

test('validEmail filters junk', () => {
  assert.ok(auth.validEmail('a@b.co'));
  assert.ok(!auth.validEmail('not-an-email'));
  assert.ok(!auth.validEmail(''));
});

// ---------- GA4 ----------

test('buildJwt produces a verifiable RS256 service-account JWT', () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwt = buildJwt('svc@project.iam.gserviceaccount.com', privateKey, 1700000000);
  const [h, c, s] = jwt.split('.');
  assert.deepStrictEqual(JSON.parse(Buffer.from(h, 'base64url')), { alg: 'RS256', typ: 'JWT' });
  const claims = JSON.parse(Buffer.from(c, 'base64url'));
  assert.strictEqual(claims.iss, 'svc@project.iam.gserviceaccount.com');
  assert.strictEqual(claims.aud, 'https://oauth2.googleapis.com/token');
  assert.strictEqual(claims.exp - claims.iat, 3600);
  const verified = crypto.createVerify('RSA-SHA256')
    .update(`${h}.${c}`)
    .verify(publicKey, Buffer.from(s, 'base64url'));
  assert.strictEqual(verified, true);
});

test('parseConnection validates and normalizes inputs', () => {
  assert.throws(() => parseConnection({ propertyId: 'abc' }), /numeric/);
  assert.throws(() => parseConnection({ propertyId: '123', serviceAccountJson: 'not json' }), /valid JSON/);
  assert.throws(() => parseConnection({ propertyId: '123', serviceAccountJson: '{}' }), /client_email/);
  const conn = parseConnection({
    propertyId: 'properties/123456',
    serviceAccountJson: JSON.stringify({
      client_email: 'svc@p.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n',
    }),
  });
  assert.strictEqual(conn.propertyId, '123456');
  assert.strictEqual(conn.clientEmail, 'svc@p.iam.gserviceaccount.com');
});

test('flattenReport merges dimension and metric headers', () => {
  const rows = flattenReport({
    dimensionHeaders: [{ name: 'pagePath' }],
    metricHeaders: [{ name: 'sessions' }],
    rows: [{ dimensionValues: [{ value: '/home' }], metricValues: [{ value: '42' }] }],
  });
  assert.deepStrictEqual(rows, [{ pagePath: '/home', sessions: 42 }]);
});

// ---------- performance ----------

test('performanceReport computes p75 with CWV ratings', () => {
  const events = [];
  for (let i = 1; i <= 100; i++) {
    events.push({ type: 'vital', name: 'LCP', value: i * 40, visitorId: `v${i}`, url: 'https://x.com/p' });
  }
  events.push({ type: 'vital', name: 'CLS', value: 0.05, visitorId: 'v1', url: 'https://x.com/p' });
  const r = performanceReport(events);
  const page = r.pages[0];
  assert.strictEqual(page.page, '/p');
  assert.strictEqual(page.LCP.p75, 3000); // 75th of 40..4000
  assert.strictEqual(page.LCP.rating, 'needs-improvement');
  assert.strictEqual(page.CLS.rating, 'good');
  assert.strictEqual(rating('INP', 600), 'poor');
});

test('slowPages flags only trafficked non-good LCP pages', () => {
  const mk = (page, lcp, n) => Array.from({ length: n }, (_, i) =>
    ({ type: 'vital', name: 'LCP', value: lcp, visitorId: `${page}${i}`, url: `https://x.com${page}` }));
  const r = performanceReport([
    ...mk('/slow', 4500, 30),
    ...mk('/fast', 1200, 30),
    ...mk('/thin', 6000, 3), // too few samples
  ]);
  const flagged = slowPages(r);
  assert.strictEqual(flagged.length, 1);
  assert.strictEqual(flagged[0].page, '/slow');
});
