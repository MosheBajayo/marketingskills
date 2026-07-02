# CRO Platform for DTC Brands

A self-contained conversion rate optimization platform MVP. **Zero dependencies** — pure Node.js 18+, no `npm install` needed.

## What it does

| Module | Description |
|--------|-------------|
| **Accounts & activation** | Sign up / sign in (scrypt password hashing, HMAC-signed session cookies — no dependencies). Every site has a setup-status checklist that verifies the snippet is actually live and which capabilities are receiving data. Optional `SIGNUP_CODE` env gates open registration. |
| **A/B Experiments** | Create multi-variant tests with weighted traffic splits. Deterministic visitor bucketing (FNV-1a), two-proportion z-test significance, Wilson confidence intervals, sample-ratio-mismatch (SRM) detection, required-sample-size guidance — plus audience targeting and per-segment result breakdowns. |
| **Audience segmentation** | Rule-based segments (device, new vs returning, session count, channel, path, time) evaluated client-side. Segments target experiments and personalizations and filter every report. |
| **Personalization** | Dynamic Yield-style experiences: serve DOM changes to a segment with a deterministic holdback control, measured with the same statistics as an A/B test. |
| **GA4 integration** | Connect a Google Analytics 4 property with a service account (zero-dep RS256 JWT auth). Canned reports (overview, channels, pages, trend), a custom report builder with saved reports, and a platform-vs-GA4 comparison that surfaces tracking gaps. |
| **Website performance** | Real-user Core Web Vitals (LCP, CLS, INP, TTFB) collected by the snippet, reported at p75 per page with Google's thresholds, and fed into insights (slow pages that cost conversions). |
| **Tracking snippet** | One `<script>` tag for any storefront (Shopify, WooCommerce, custom). Assigns visitors to variants, applies DOM changes (text/HTML/style/hide) without code deploys, and tracks pageviews, funnel steps, and conversions with revenue via `sendBeacon`. |
| **Ads & attribution** | Captures UTMs, `gclid`/`fbclid`/`ttclid` click IDs, and referrers as first touch (persisted) and last touch (per session). Channel report with visitors, CVR, revenue, and — once you add campaign spend — ROAS, CPA, CPC, CTR per source/medium/campaign, under first- or last-touch models. Includes a UTM link builder. |
| **Funnel analytics** | The default DTC funnel plus a builder for custom funnels (any mix of pageview/step/conversion stages), with per-stage drop-off, biggest-leak detection, and audience/channel filters for side-by-side comparison. |
| **Insights engine** | The full picture: cross-references spend, attribution, funnel behavior, tracking hygiene, and experiment results into prioritized findings (scale/kill campaigns, creative fatigue, UTM mismatches, funnel leaks, significant winners, SRM alarms). |
| **CRO Audits** | Fetches any URL and scores it against 16 conversion heuristics: value proposition, CTAs, social proof, trust signals, form friction, mobile readiness, page weight, and more. Produces a graded report and a prioritized action plan. |
| **Playbooks** | A curated library of DTC CRO and paid-ads plays (landing page, product page, checkout, email capture, retention, creative testing, UTM discipline), each mapped to a skill in this repo's `skills/` directory for full methodology. |
| **Dashboard** | Vanilla-JS single-page app: program overview with revenue/spend/ROAS, insights, channels, funnel, experiments with significance badges, audit reports, and snippet install guide. |

## Quick start

```bash
cd cro-platform
npm run demo        # seeds demo data + starts the server
```

Then open:

- **Dashboard**: http://localhost:4600/ — sign in with **demo@example.com / demo1234** (seeded), or create your own account
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

## Measuring ads performance end to end

1. **Tag every ad** with UTMs (use the UTM builder on the Ads & Channels page): `?utm_source=meta&utm_medium=cpc&utm_campaign=prospecting-broad`. The snippet also auto-detects `gclid`/`fbclid`/`ttclid` click IDs.
2. **Track the funnel** with markup or JS:
   ```html
   <button data-cro-track="add_to_cart">Add to Cart</button>
   ```
   ```js
   window.CRO.track('begin_checkout');
   ```
3. **Pass revenue on conversion** so ROAS can be computed:
   ```js
   window.CRO.convert('purchase', { value: orderTotal });
   ```
4. **Add campaign spend** on the Ads & Channels page (or `POST /api/campaigns`) with UTMs that exactly match the ads. For automated pulls from ad platforms, see `tools/integrations/google-ads.md` and `tools/integrations/composio.md` (Meta Ads / LinkedIn Ads) in this repo.
5. **Read the full picture**: the Channels page shows visitors, CVR, revenue, ROAS, CPA, CPC, and CTR per channel (first- or last-touch); the Funnel page shows where visitors leak; the Insights page cross-references all of it into prioritized actions.

## Architecture

```
cro-platform/
├── server.js                  # HTTP server: REST API + tracking endpoints + static dashboard
├── lib/
│   ├── store.js               # JSON-file persistence (sites, experiments, events, audits, campaigns)
│   ├── stats.js               # z-test, Wilson CI, chi-square SRM, sample-size calc
│   ├── experiments.js         # validation, FNV-1a bucketing, results computation
│   ├── attribution.js         # channel derivation, channel report (ROAS/CPA), funnel report
│   ├── insights.js            # full-picture insights engine (spend × funnel × experiments)
│   ├── audit.js               # heuristic page-audit engine (16 weighted checks)
│   ├── recommendations.js     # playbook library mapped to skills/ in this repo
│   └── snippet.template.js    # embeddable client snippet (site ID templated in)
├── public/                    # dashboard SPA (index.html, app.js, styles.css) + demo store
├── scripts/seed.js            # demo data generator
└── test/                      # node:test suites (unit + API integration)
```

## Going live on a real website

1. **Create an account** (first visit shows the signup screen; set `SIGNUP_CODE=<code>` to require an invite).
2. **Add your site** → copy the snippet from the Install page into your storefront's `<head>`. Deploy the platform somewhere your site can reach (any Node 18+ host) and use that host in the snippet URL.
3. **Verify activation**: Sites → *Setup status* shows whether events are arriving and which capabilities are live (traffic, attribution, funnel steps, conversions, revenue, vitals, campaigns, experiments, GA4).
4. **Connect GA4** (GA4 Reports page): create a Google Cloud service account, enable the *Google Analytics Data API*, grant the service-account email Viewer access on the GA4 property, paste the property id + JSON key. The connection is verified with a live query before saving.
5. Web vitals, attribution, and funnel data start flowing automatically; add campaign spend and start your first experiment.

### API surface

```
POST /api/auth/signup|login|logout        accounts (session cookie)
GET  /api/auth/me                         current user
GET  /api/sites/:id/status                activation checklist (is the snippet live?)
POST|DELETE /api/sites/:id/ga4            connect/disconnect GA4 (service account)
GET  /api/ga4/:siteId/report?type=        GA4 canned/custom reports (overview|channels|pages|trend)
GET  /api/ga4/:siteId/compare             platform-tracked vs GA4 discrepancy check
GET|POST /api/reports  /:id/run           saved custom GA4 reports
GET  /api/segments  /api/personalizations audiences & experiences (+ /:id/results)
GET|POST /api/funnels                     custom funnel definitions
GET  /api/performance                     real-user web vitals (p75 per page)
GET  /api/overview                        program-level metrics (incl. revenue, spend, ROAS)
GET|POST /api/sites                       manage brand sites
GET|POST /api/experiments                 manage experiments
POST /api/experiments/:id/status          start/stop ({status: running|stopped|draft})
GET  /api/experiments/:id/results         computed results + significance + SRM
GET|POST /api/campaigns                   ad spend entries (utmSource/Medium/Campaign, spend, clicks, impressions)
GET  /api/channels?model=last|first       attribution report: visitors, CVR, revenue, ROAS, CPA per channel
GET  /api/funnel                          funnel stages with drop-off + biggest-leak detection
GET  /api/insights                        prioritized full-picture findings
GET|POST /api/audits                      run/read CRO audits ({url} or {html})
GET  /api/playbooks?category=             recommendation library

GET  /t/snippet.js?site=SITE_ID           embeddable snippet
GET  /t/config?site=SITE_ID               running experiments for assignment
POST /t/collect                           event ingestion (batched, CORS-open)
```

Data persists to `data/db.json` (gitignored). Point `DATA_FILE` elsewhere to relocate it.

## MVP limits & next steps

- JSON-file storage — swap `lib/store.js` for SQLite/Postgres for production scale.
- Auth is a single shared workspace: all signed-in users see the same data (sites record their creator for a future per-account isolation migration). Use `SIGNUP_CODE` to gate registration, and HTTPS in production (put the server behind a TLS proxy).
- GA4 service-account keys are stored in the data file — restrict filesystem access, or move secrets to a vault for production.
- Campaign spend is entered manually (UI or API); automated ad-platform sync via the MCP integrations in `tools/` is the upgrade path.
- Attribution is single-touch (first or last); multi-touch/position-based models are a natural extension on the same event data.
- Audit engine is regex-heuristic; a headless-browser audit (LCP, real above-the-fold) is the upgrade path.
