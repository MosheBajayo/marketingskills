# CRO Platform for DTC Brands

A self-contained conversion rate optimization platform MVP. **Zero dependencies** — pure Node.js 18+, no `npm install` needed.

## What it does

| Module | Description |
|--------|-------------|
| **A/B Experiments** | Create multi-variant tests with weighted traffic splits. Deterministic visitor bucketing (FNV-1a), two-proportion z-test significance, Wilson confidence intervals, sample-ratio-mismatch (SRM) detection, and required-sample-size guidance. |
| **Tracking snippet** | One `<script>` tag for any storefront (Shopify, WooCommerce, custom). Assigns visitors to variants, applies DOM changes (text/HTML/style/hide) without code deploys, and tracks pageviews + conversions via `sendBeacon`. |
| **CRO Audits** | Fetches any URL and scores it against 16 conversion heuristics: value proposition, CTAs, social proof, trust signals, form friction, mobile readiness, page weight, and more. Produces a graded report and a prioritized action plan. |
| **Playbooks** | A curated library of DTC CRO plays (landing page, product page, checkout, email capture, retention), each mapped to a skill in this repo's `skills/` directory for full methodology. |
| **Dashboard** | Vanilla-JS single-page app: program overview, site management, experiment results with significance badges, audit reports, and snippet install guide. |

## Quick start

```bash
cd cro-platform
npm run demo        # seeds demo data + starts the server
```

Then open:

- **Dashboard**: http://localhost:4600/
- **Demo storefront**: http://localhost:4600/demo.html — a fake DTC product page with the snippet installed and a live headline experiment running. Reload in a private window to get bucketed as a new visitor; click *Add to Cart* to fire a conversion, then watch it appear in the experiment results.

Or step by step:

```bash
node scripts/seed.js   # optional: demo brand, running experiment w/ 2,600 visitors, audit
node server.js         # http://localhost:4600 (PORT=... to change)
```

## Run the tests

```bash
npm test               # node --test: stats, experiments, audit engine, full API flow
```

## Running an A/B test end to end

1. **Add a site** (Sites page) → you get a site ID.
2. **Install the snippet** on your storefront `<head>`:
   ```html
   <script src="https://YOUR_HOST/t/snippet.js?site=SITE_ID" async></script>
   ```
3. **Create an experiment** (Experiments page): name, conversion goal, hypothesis, optional URL targeting, and 2+ variants. Non-control variants can declare DOM changes (e.g. replace the hero H1 text) that the snippet applies automatically — no code deploy needed.
4. **Start it.** The snippet buckets each visitor deterministically by hashing `experimentId:visitorId`, so the same visitor always sees the same variant.
5. **Track conversions** — either markup or JS:
   ```html
   <button data-cro-convert="purchase">Complete order</button>
   ```
   ```js
   window.CRO.convert('purchase'); // e.g. on the order confirmation page
   ```
6. **Read results**: the experiment page shows per-variant rates, 95% confidence intervals, relative uplift, p-values (two-proportion z-test, significant at p < 0.05), an SRM validity check, and how many visitors per variant you need for 80% power.

## Architecture

```
cro-platform/
├── server.js                  # HTTP server: REST API + tracking endpoints + static dashboard
├── lib/
│   ├── store.js               # JSON-file persistence (sites, experiments, events, audits)
│   ├── stats.js               # z-test, Wilson CI, chi-square SRM, sample-size calc
│   ├── experiments.js         # validation, FNV-1a bucketing, results computation
│   ├── audit.js               # heuristic page-audit engine (16 weighted checks)
│   ├── recommendations.js     # playbook library mapped to skills/ in this repo
│   └── snippet.template.js    # embeddable client snippet (site ID templated in)
├── public/                    # dashboard SPA (index.html, app.js, styles.css) + demo store
├── scripts/seed.js            # demo data generator
└── test/                      # node:test suites (unit + API integration)
```

### API surface

```
GET  /api/overview                        program-level metrics
GET|POST /api/sites                       manage brand sites
GET|POST /api/experiments                 manage experiments
POST /api/experiments/:id/status          start/stop ({status: running|stopped|draft})
GET  /api/experiments/:id/results         computed results + significance + SRM
GET|POST /api/audits                      run/read CRO audits ({url} or {html})
GET  /api/playbooks?category=             recommendation library

GET  /t/snippet.js?site=SITE_ID           embeddable snippet
GET  /t/config?site=SITE_ID               running experiments for assignment
POST /t/collect                           event ingestion (batched, CORS-open)
```

Data persists to `data/db.json` (gitignored). Point `DATA_FILE` elsewhere to relocate it.

## MVP limits & next steps

- JSON-file storage — swap `lib/store.js` for SQLite/Postgres for production scale.
- No auth — add API keys per site before exposing publicly.
- Conversion attribution is per-visitor per-experiment; revenue/AOV tracking is a natural next metric.
- Audit engine is regex-heuristic; a headless-browser audit (LCP, real above-the-fold) is the upgrade path.
