#!/usr/bin/env node
/**
 * data_parser.js — Analytics export normalizer for AI agent consumption.
 *
 * Ingests raw CSV/JSON exports (GA4, Mixpanel, Triple Whale, Shopify),
 * cleans and validates the rows, computes core DTC funnel metrics, and
 * emits a structured Markdown + JSON summary that the agents in /agents
 * can read directly.
 *
 * Zero dependencies. Node 18+.
 *
 * Usage:
 *   node automations/data_parser.js <input-file> [options]
 *
 * Options:
 *   --format md|json|both   Output format (default: both)
 *   --out <dir>             Output directory (default: alongside input)
 *   --source <name>         Source label: ga4|mixpanel|triplewhale|shopify|other
 *   --client <name>         Client name stamped into the summary header
 *
 * Examples:
 *   node automations/data_parser.js clients/acme/raw/ga4_funnel.csv --source ga4 --client Acme
 *   node automations/data_parser.js export.json --format md --out clients/acme/parsed
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Column aliases — map the many names analytics platforms use onto one schema
// ---------------------------------------------------------------------------

const COLUMN_ALIASES = {
  date: ['date', 'day', 'event_date', 'ga:date', 'period'],
  sessions: ['sessions', 'visits', 'ga:sessions', 'total_sessions'],
  users: ['users', 'total users', 'totalusers', 'unique_users', 'visitors'],
  product_views: ['product_views', 'view_item', 'item_views', 'pdp_views', 'items_viewed'],
  add_to_carts: ['add_to_carts', 'add_to_cart', 'addtocarts', 'atc', 'adds_to_cart'],
  checkouts: ['checkouts', 'begin_checkout', 'checkout_starts', 'checkouts_started', 'reached_checkout'],
  purchases: ['purchases', 'orders', 'transactions', 'purchase', 'total_orders', 'conversions'],
  revenue: ['revenue', 'total_revenue', 'purchase_revenue', 'total_sales', 'gross_sales', 'itemrevenue'],
  ad_spend: ['ad_spend', 'spend', 'cost', 'total_spend', 'amount_spent'],
  refunds: ['refunds', 'refund_amount', 'returns'],
  device: ['device', 'device_category', 'devicecategory', 'platform'],
  source: ['source', 'channel', 'utm_source', 'session_source', 'traffic_source', 'sessiondefaultchannelgroup'],
};

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { format: 'both', out: null, source: 'other', client: 'Client', input: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format') args.format = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--source') args.source = argv[++i];
    else if (a === '--client') args.client = argv[++i];
    else if (!a.startsWith('--') && !args.input) args.input = a;
  }
  return args;
}

function usage() {
  const lines = fs.readFileSync(__filename, 'utf8').split('\n');
  const doc = lines.slice(1, lines.findIndex((l) => l.includes("'use strict'"))).join('\n');
  console.log(doc.replace(/^\s?\*\s?/gm, '').replace(/\/\*\*|\*\//g, '').trim());
}

// ---------------------------------------------------------------------------
// Ingestion — CSV and JSON
// ---------------------------------------------------------------------------

function parseCSV(text) {
  // RFC-4180-aware minimal parser: handles quoted fields, embedded commas,
  // embedded newlines, and doubled quotes.
  const rows = [];
  let field = '', row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];

  // GA4 exports often prepend "# ----" comment lines before the header.
  let headerIdx = rows.findIndex((r) => r.length > 1 && !String(r[0]).startsWith('#'));
  if (headerIdx === -1) headerIdx = 0;
  const header = rows[headerIdx].map((h) => h.trim());
  return rows.slice(headerIdx + 1)
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

function loadRecords(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  if (filePath.toLowerCase().endsWith('.json')) {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data;
    // Common wrappers: { rows: [...] }, { data: [...] }, { results: [...] }
    for (const key of ['rows', 'data', 'results', 'records']) {
      if (Array.isArray(data[key])) return data[key];
    }
    return [data];
  }
  return parseCSV(text);
}

// ---------------------------------------------------------------------------
// Cleaning & normalization
// ---------------------------------------------------------------------------

function normalizeKey(key) {
  return String(key).toLowerCase().trim().replace(/[\s\-.]+/g, '_');
}

function canonicalField(rawKey) {
  const norm = normalizeKey(rawKey);
  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((a) => normalizeKey(a) === norm)) return canonical;
  }
  return null;
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[$,%\s]/g, '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function cleanRecords(records) {
  const issues = [];
  let dropped = 0;
  const cleaned = [];

  for (const record of records) {
    const out = { _extra: {} };
    let hasCanonical = false;
    for (const [key, value] of Object.entries(record)) {
      const canonical = canonicalField(key);
      if (!canonical) { out._extra[normalizeKey(key)] = value; continue; }
      hasCanonical = true;
      if (canonical === 'date' || canonical === 'device' || canonical === 'source') {
        out[canonical] = String(value).trim();
      } else {
        out[canonical] = toNumber(value);
      }
    }
    if (!hasCanonical) { dropped++; continue; }
    cleaned.push(out);
  }

  if (dropped) issues.push(`${dropped} row(s) dropped: no recognizable metric columns.`);

  // Integrity flags the Data Diagnostics Agent should see
  const negatives = cleaned.filter((r) =>
    ['sessions', 'purchases', 'revenue'].some((k) => r[k] !== null && r[k] !== undefined && r[k] < 0));
  if (negatives.length) issues.push(`${negatives.length} row(s) contain negative core metrics — check for refund rows mixed into sales exports.`);

  const funnelViolations = cleaned.filter((r) =>
    r.purchases != null && r.checkouts != null && r.purchases > r.checkouts);
  if (funnelViolations.length) issues.push(`${funnelViolations.length} row(s) where purchases > checkout starts — event tracking may be double-firing.`);

  return { cleaned, issues };
}

// ---------------------------------------------------------------------------
// Metric computation
// ---------------------------------------------------------------------------

function sum(rows, key) {
  const vals = rows.map((r) => r[key]).filter((v) => typeof v === 'number');
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
}

function pct(numerator, denominator) {
  if (numerator == null || !denominator) return null;
  return (numerator / denominator) * 100;
}

function computeMetrics(rows) {
  const totals = {};
  for (const key of ['sessions', 'users', 'product_views', 'add_to_carts', 'checkouts', 'purchases', 'revenue', 'ad_spend', 'refunds']) {
    totals[key] = sum(rows, key);
  }

  const m = {
    ...totals,
    cvr_sitewide: pct(totals.purchases, totals.sessions),
    view_to_atc: pct(totals.add_to_carts, totals.product_views),
    atc_to_checkout: pct(totals.checkouts, totals.add_to_carts),
    checkout_to_purchase: pct(totals.purchases, totals.checkouts),
    cart_abandonment: totals.add_to_carts ? 100 - (pct(totals.purchases, totals.add_to_carts) ?? 0) : null,
    checkout_abandonment: totals.checkouts ? 100 - (pct(totals.purchases, totals.checkouts) ?? 0) : null,
    aov: totals.purchases ? (totals.revenue ?? 0) / totals.purchases : null,
    revenue_per_session: totals.sessions ? (totals.revenue ?? 0) / totals.sessions : null,
    roas: totals.ad_spend ? (totals.revenue ?? 0) / totals.ad_spend : null,
  };
  return m;
}

function segmentBreakdown(rows, dimension) {
  const groups = new Map();
  for (const r of rows) {
    const key = r[dimension];
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  if (groups.size < 2) return null;
  const out = {};
  for (const [key, groupRows] of groups) out[key] = computeMetrics(groupRows);
  return out;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const fmt = {
  num: (v) => (v == null ? '—' : Math.round(v).toLocaleString('en-US')),
  pct: (v) => (v == null ? '—' : `${v.toFixed(2)}%`),
  usd: (v) => (v == null ? '—' : `$${v.toFixed(2)}`),
  x: (v) => (v == null ? '—' : `${v.toFixed(2)}x`),
};

function renderMarkdown({ client, source, inputFile, rowCount, issues, metrics, segments }) {
  const lines = [];
  lines.push(`# Parsed Analytics Summary — ${client}`);
  lines.push('');
  lines.push(`- **Source**: ${source} (\`${path.basename(inputFile)}\`)`);
  lines.push(`- **Rows analyzed**: ${rowCount}`);
  lines.push('');

  lines.push('## Data Integrity Flags');
  lines.push('');
  lines.push(issues.length ? issues.map((i) => `- ⚠️ ${i}`).join('\n') : '- ✅ No integrity issues detected in this export.');
  lines.push('');

  lines.push('## Funnel Totals');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---|');
  lines.push(`| Sessions | ${fmt.num(metrics.sessions)} |`);
  lines.push(`| Product Views | ${fmt.num(metrics.product_views)} |`);
  lines.push(`| Add to Carts | ${fmt.num(metrics.add_to_carts)} |`);
  lines.push(`| Checkout Starts | ${fmt.num(metrics.checkouts)} |`);
  lines.push(`| Purchases | ${fmt.num(metrics.purchases)} |`);
  lines.push(`| Revenue | ${fmt.usd(metrics.revenue)} |`);
  lines.push('');

  lines.push('## Core DTC Metrics');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---|');
  lines.push(`| Sitewide CVR | ${fmt.pct(metrics.cvr_sitewide)} |`);
  lines.push(`| PDP → ATC | ${fmt.pct(metrics.view_to_atc)} |`);
  lines.push(`| ATC → Checkout | ${fmt.pct(metrics.atc_to_checkout)} |`);
  lines.push(`| Checkout → Purchase | ${fmt.pct(metrics.checkout_to_purchase)} |`);
  lines.push(`| Cart Abandonment | ${fmt.pct(metrics.cart_abandonment)} |`);
  lines.push(`| Checkout Abandonment | ${fmt.pct(metrics.checkout_abandonment)} |`);
  lines.push(`| AOV | ${fmt.usd(metrics.aov)} |`);
  lines.push(`| Revenue per Session | ${fmt.usd(metrics.revenue_per_session)} |`);
  lines.push(`| ROAS | ${fmt.x(metrics.roas)} |`);
  lines.push('');

  for (const [dim, breakdown] of Object.entries(segments)) {
    if (!breakdown) continue;
    lines.push(`## Segment Breakdown — ${dim}`);
    lines.push('');
    lines.push('| Segment | Sessions | CVR | AOV | RPS | Cart Abandon |');
    lines.push('|---|---|---|---|---|---|');
    for (const [seg, m] of Object.entries(breakdown)) {
      lines.push(`| ${seg} | ${fmt.num(m.sessions)} | ${fmt.pct(m.cvr_sitewide)} | ${fmt.usd(m.aov)} | ${fmt.usd(m.revenue_per_session)} | ${fmt.pct(m.cart_abandonment)} |`);
    }
    lines.push('');
  }

  lines.push('## Agent Handoff Notes');
  lines.push('');
  lines.push('- Feed this summary to `agents/data_diagnostics_agent.md` for leak ranking.');
  lines.push('- Metrics marked `—` were absent from this export; do not treat as zero.');
  lines.push('- Integrity flags above must be resolved or caveated before client-facing use.');
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) { usage(); process.exit(args.input === null ? 0 : 1); }
  if (!fs.existsSync(args.input)) {
    console.error(`Error: input file not found: ${args.input}`);
    process.exit(1);
  }

  const records = loadRecords(args.input);
  if (!records.length) {
    console.error('Error: no records found in input file.');
    process.exit(1);
  }

  const { cleaned, issues } = cleanRecords(records);
  if (!cleaned.length) {
    console.error('Error: no rows survived cleaning — column names not recognized. Extend COLUMN_ALIASES for this export format.');
    process.exit(1);
  }

  const metrics = computeMetrics(cleaned);
  const segments = {
    device: segmentBreakdown(cleaned, 'device'),
    source: segmentBreakdown(cleaned, 'source'),
  };

  const summary = {
    client: args.client,
    source: args.source,
    input_file: path.basename(args.input),
    rows_analyzed: cleaned.length,
    integrity_flags: issues,
    metrics,
    segments,
  };

  const outDir = args.out || path.dirname(args.input);
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.join(outDir, path.basename(args.input).replace(/\.[^.]+$/, '') + '_summary');

  if (args.format === 'json' || args.format === 'both') {
    fs.writeFileSync(`${base}.json`, JSON.stringify(summary, null, 2));
    console.log(`Wrote ${base}.json`);
  }
  if (args.format === 'md' || args.format === 'both') {
    fs.writeFileSync(`${base}.md`, renderMarkdown({
      client: args.client, source: args.source, inputFile: args.input,
      rowCount: cleaned.length, issues, metrics, segments,
    }));
    console.log(`Wrote ${base}.md`);
  }
}

main();
