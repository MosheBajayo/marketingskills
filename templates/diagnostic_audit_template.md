# Conversion Diagnostic Audit

**Client:** {Client Name}
**Prepared by:** {Agency Name}
**Date range analyzed:** {Start} – {End}
**Store platform / stack:** {Shopify / headless / other} · {GA4, Mixpanel, Triple Whale, Hotjar/Clarity, Klaviyo, ...}
**Engagement:** Diagnostic Audit ($5,000)

---

## Executive Summary

> One page. Written last, read first. No jargon — a founder should absorb the whole story in three minutes.

- **Total recoverable revenue identified:** ${X}–${Y} / month (conservative–moderate range)
- **The single biggest leak:** {one sentence: where, who, how much}
- **The three moves that matter most:** {1-line each}
- **Data trust status:** {High / Medium / Low} — {one-sentence caveat if applicable}

---

## 1. Data Integrity Check

*Before we trust any number, we verify the numbers.*

### 1.1 Source-of-Truth Reconciliation

| Metric (period) | Platform (Shopify) | GA4 | Triple Whale | Max Discrepancy | Status |
|---|---|---|---|---|---|
| Orders | | | | % | ✅ / ⚠️ / ❌ |
| Revenue | | | | % | |
| Sessions | | n/a | | % | |

### 1.2 Event Coverage Audit

| Funnel Event | Fires on Desktop | Fires on Mobile | All Templates | Notes |
|---|---|---|---|---|
| `view_item` | | | | |
| `add_to_cart` | | | | |
| `begin_checkout` | | | | |
| `add_payment_info` | | | | |
| `purchase` | | | | |

### 1.3 Known Gaps & Fixes Required

- {e.g., consent-mode losses on EU traffic ~X%; purchase event double-firing on refresh; missing UTM governance on email}

**Data Trust Score: {High / Medium / Low}**
*{If Medium/Low: which findings below carry caveats, and the instrumentation fixes required before the testing program starts.}*

---

## 2. Quantitative Funnel Analysis

### 2.1 The Funnel

| Step | Users | Step CVR | DTC Benchmark | Gap | Est. Monthly Revenue at Stake |
|---|---|---|---|---|---|
| Sessions | | — | — | — | — |
| Product View | | % | % | | $ |
| Add to Cart | | % | % | | $ |
| Checkout Start | | % | % | | $ |
| Payment Info | | % | % | | $ |
| Purchase | | % | % | | $ |

**Cart abandonment:** {X}% · **Checkout abandonment:** {X}% · **Sitewide CVR:** {X}% · **RPS:** ${X}

### 2.2 Segment Deep-Dive

| Segment | CVR | AOV | RPS | vs. Sitewide | Insight |
|---|---|---|---|---|---|
| Mobile / Desktop | | | | | |
| Paid social / Paid search / Organic / Email / Direct | | | | | |
| New / Returning | | | | | |
| Top landing pages (top 5) | | | | | |
| Top products (top 5 by sessions) | | | | | |

### 2.3 Unit Economics Context

- **AOV:** ${X} (median ${X} — distribution note: {...})
- **60/90-day LTV:** ${X} / ${X} · **LTV:CAC:** {X}
- **Blended ROAS / NC-ROAS:** {X} / {X}
- **Repeat purchase rate (90d):** {X}%
- *Why this matters:* {e.g., healthy LTV means we can afford AOV-neutral CVR tests; thin margins mean guardrails on discounting tests}

### 2.4 Top Leaks — Ranked by Recoverable Revenue

| # | Leak | Segment | Evidence | Est. Recoverable $/mo |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 3. Qualitative UX Review

*The numbers above tell us where. This section tells us why.*

### 3.1 Evidence Base

- Heatmaps/scrollmaps reviewed: {pages, date range, sample sizes}
- Session recordings reviewed: {n recordings, filters used — e.g., mobile checkout abandoners}
- Survey/poll data: {n responses, questions asked}

### 3.2 LIFT Model Scorecard (key pages)

| Page | Value Prop | Relevance | Clarity | Urgency | Anxiety | Distraction | Overall |
|---|---|---|---|---|---|---|---|
| Homepage | /10 | | | | | | |
| Top PDP | | | | | | | |
| Cart | | | | | | | |
| Checkout | | | | | | | |
| Top LP (paid) | | | | | | | |

### 3.3 Behavioral Findings

> Each finding pairs with a quantified leak from Section 2 and cites at least two evidence sources.

#### Finding {n}: {Title}
- **Explains leak #{n}** ({page/step, segment})
- **Evidence:** {heatmap %s, recording counts, verbatims}
- **Severity:** {Critical / High / Medium / Low}
- **What visitors experience:** {2–3 sentences, plain language}
- **Screenshot/annotation:** {ref}

### 3.4 Voice-of-Customer Highlights

> Verbatim quotes — this language feeds test copy.

- "{quote}" — {source, context}

---

## 4. Message Scent & Creative Alignment

*Does the promise in the ad survive the click?*

### 4.1 Ad → Landing Page Scent Audit

| Ad/Creative (channel) | Promise / Hook | Landing Page | Scent Match | Break Point |
|---|---|---|---|---|
| {Meta ad ref} | | | Strong / Partial / Broken | {e.g., hero doesn't mention the offer} |

### 4.2 Offer & Value Proposition Consistency

- Ad offer vs. on-site offer: {aligned / mismatch — details}
- Price/discount framing consistency: {...}
- Social proof continuity (creator ads → PDP reviews): {...}

### 4.3 Email/SMS → Site Scent

- {Flow-level notes: abandoned-cart promise vs. cart state; post-purchase cross-sell relevance}

### 4.4 ROAS Implication

- {Which scent breaks correlate with high-spend, low-CVR paths — est. wasted spend $/mo}

---

## 5. Final Experimentation Matrix

*Everything above, converted into a scored, sequenced testing program.*

### 5.1 Prioritized Backlog (ICE-scored)

| # | Hypothesis | Page/Step | Impact | Confidence | Ease | ICE | Primary Metric | Guardrails | Est. Weeks to Significance |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | /10 | /10 | /10 | | | | |
| 2 | | | | | | | | | |
| 3 | | | | | | | | | |

### 5.2 Quick Wins (ship without testing)

> Fixes with no plausible downside — broken elements, tracking repairs, accessibility issues.

- [ ] {fix} — owner: {…}

### 5.3 90-Day Sequencing Plan

| Sprint | Tests Running | Pages Touched | Expected Learnings |
|---|---|---|---|
| 1 (wk 1–2) | | | |
| 2 (wk 3–4) | | | |
| 3 (wk 5–6) | | | |

### 5.4 Projected Program Impact

- Conservative scenario: +{X}% CVR / +${X} AOV → **~${X}/mo**
- Moderate scenario: → **~${X}/mo**
- Assumptions: {traffic held constant, test win rate {X}%, ...}

---

## Appendix

- A. Methodology & statistical standards (95% confidence, 80% power, pre-registered MDEs)
- B. Full tracking audit worksheet
- C. All heatmap/recording exhibits
- D. Glossary (AOV, LTV, RPS, NC-ROAS, MDE, ICE)
