// GA4 Data API client — zero dependencies. Authenticates with a Google
// service account (RS256 JWT signed via node:crypto, exchanged for an
// OAuth2 access token) and runs reports against the GA4 Data API.
//
// Setup for a site:
//  1. Google Cloud console → create a service account, download its JSON key.
//  2. Enable the "Google Analytics Data API" on the project.
//  3. In GA4 Admin → Property access management, add the service account
//     email as a Viewer.
//  4. Paste the JSON key + numeric property id into the platform.
'use strict';

const crypto = require('node:crypto');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = 'https://analyticsdata.googleapis.com/v1beta';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

const b64url = (buf) => Buffer.from(buf).toString('base64url');

// Build and sign the service-account JWT (RS256).
function buildJwt(clientEmail, privateKey, nowSec = Math.floor(Date.now() / 1000)) {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: nowSec,
    exp: nowSec + 3600,
  }));
  const input = `${header}.${claims}`;
  const signature = crypto.createSign('RSA-SHA256').update(input).sign(privateKey);
  return `${input}.${b64url(signature)}`;
}

// Exchange the JWT for an access token. Tokens are cached per client email.
const tokenCache = new Map();

async function getAccessToken(clientEmail, privateKey) {
  const cached = tokenCache.get(clientEmail);
  if (cached && cached.expiresAt > Date.now() + 60e3) return cached.token;
  const jwt = buildJwt(clientEmail, privateKey);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`GA4 auth failed: ${data.error_description || data.error || res.status}`);
  }
  tokenCache.set(clientEmail, {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  });
  return data.access_token;
}

async function runReport(ga4Config, body) {
  const token = await getAccessToken(ga4Config.clientEmail, ga4Config.privateKey);
  const res = await fetch(`${API_BASE}/properties/${ga4Config.propertyId}:runReport`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`GA4 report failed: ${(data.error && data.error.message) || res.status}`);
  }
  return data;
}

// Flatten a GA4 response into [{<dimension>: v, <metric>: n, ...}].
function flattenReport(response) {
  const dims = (response.dimensionHeaders || []).map((h) => h.name);
  const mets = (response.metricHeaders || []).map((h) => h.name);
  return (response.rows || []).map((row) => {
    const out = {};
    dims.forEach((d, i) => { out[d] = row.dimensionValues[i].value; });
    mets.forEach((m, i) => { out[m] = Number(row.metricValues[i].value); });
    return out;
  });
}

// Whitelists for the custom report builder (a practical marketing subset).
const DIMENSIONS = [
  'date', 'sessionSource', 'sessionMedium', 'sessionCampaignName',
  'sessionDefaultChannelGroup', 'pagePath', 'landingPage', 'deviceCategory',
  'country', 'city', 'firstUserSource', 'firstUserMedium',
];
const METRICS = [
  'sessions', 'totalUsers', 'newUsers', 'screenPageViews', 'engagementRate',
  'averageSessionDuration', 'conversions', 'purchaseRevenue', 'totalRevenue',
  'addToCarts', 'checkouts', 'ecommercePurchases', 'bounceRate',
];

// Canned report definitions.
const CANNED = {
  overview: {
    metrics: ['sessions', 'totalUsers', 'newUsers', 'engagementRate', 'conversions', 'purchaseRevenue'],
    dimensions: [],
  },
  channels: {
    metrics: ['sessions', 'totalUsers', 'conversions', 'purchaseRevenue'],
    dimensions: ['sessionSource', 'sessionMedium'],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 25,
  },
  pages: {
    metrics: ['screenPageViews', 'sessions', 'conversions'],
    dimensions: ['pagePath'],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 25,
  },
  trend: {
    metrics: ['sessions', 'conversions', 'purchaseRevenue'],
    dimensions: ['date'],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  },
};

function reportBody(def, days) {
  return {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: def.dimensions.map((name) => ({ name })),
    metrics: def.metrics.map((name) => ({ name })),
    ...(def.orderBys ? { orderBys: def.orderBys } : {}),
    limit: String(def.limit || 100),
  };
}

// Run a canned or custom report definition against a connected site.
async function report(ga4Config, { type, dimensions, metrics, days = 28 }) {
  let def;
  if (type && CANNED[type]) {
    def = CANNED[type];
  } else {
    const dims = (dimensions || []).filter((d) => DIMENSIONS.includes(d));
    const mets = (metrics || []).filter((m) => METRICS.includes(m));
    if (!mets.length) throw new Error(`custom report needs at least one metric from: ${METRICS.join(', ')}`);
    def = { dimensions: dims, metrics: mets, limit: 100 };
  }
  const response = await runReport(ga4Config, reportBody(def, days));
  return {
    days,
    dimensions: def.dimensions,
    metrics: def.metrics,
    rows: flattenReport(response),
    rowCount: response.rowCount || 0,
  };
}

// Validate + normalize a connection payload (accepts a pasted service
// account JSON, or explicit clientEmail/privateKey fields).
function parseConnection(body) {
  let clientEmail = body.clientEmail;
  let privateKey = body.privateKey;
  if (body.serviceAccountJson) {
    let parsed;
    try {
      parsed = typeof body.serviceAccountJson === 'string'
        ? JSON.parse(body.serviceAccountJson) : body.serviceAccountJson;
    } catch {
      throw new Error('serviceAccountJson is not valid JSON');
    }
    clientEmail = parsed.client_email;
    privateKey = parsed.private_key;
  }
  const propertyId = String(body.propertyId || '').replace(/^properties\//, '').trim();
  if (!/^\d+$/.test(propertyId)) throw new Error('propertyId must be the numeric GA4 property id');
  if (!clientEmail || !clientEmail.includes('@')) throw new Error('service account client_email missing');
  if (!privateKey || !privateKey.includes('PRIVATE KEY')) throw new Error('service account private_key missing');
  return { propertyId, clientEmail, privateKey };
}

module.exports = { buildJwt, getAccessToken, runReport, flattenReport, report, parseConnection, DIMENSIONS, METRICS, CANNED };
