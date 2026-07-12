# SOP — Agency Workflow Cycle

**Purpose:** The core operational loop every client engagement runs on. Four phases, repeating on a two-week sprint cadence after onboarding. This is the system that turns a $5K Diagnostic Audit into a compounding experimentation retainer.

**Owner:** Head of Delivery
**Applies to:** All client engagements
**Cadence:** Phase 1 once per engagement (refreshed quarterly); Phases 2–4 loop every sprint

---

## The Loop at a Glance

```
┌─────────────────────┐     ┌─────────────────────┐
│ 1. DIAGNOSTIC AUDIT │ ──▶ │  2. HYPOTHESIS LOG  │
│  (where & why we    │     │  (evidence → ICE-   │
│   leak revenue)     │     │   scored backlog)   │
└─────────────────────┘     └──────────┬──────────┘
           ▲                           │
           │ quarterly refresh         ▼
┌──────────┴──────────┐     ┌─────────────────────┐
│  4. LEARNING LOOP   │ ◀── │ 3. SPRINT PLANNING  │
│  & DASHBOARD UPDATE │     │  (build, QA, launch │
│  (analyze, decide,  │     │   tests)            │
│   re-score backlog) │     └─────────────────────┘
└─────────────────────┘
```

---

## Phase 1 — Diagnostic Audit

**Trigger:** Signed diagnostic engagement + platform access granted.
**Duration:** 10 business days.
**Deliverable:** Completed `templates/diagnostic_audit_template.md`, presented live.

### Steps

1. **Access & instrumentation check (Day 1–2)**
   - Collect access: GA4, Mixpanel, Triple Whale, Shopify (or platform), heatmap tool, ad accounts, ESP.
   - Run the **Data Diagnostics Agent** (`agents/data_diagnostics_agent.md`) integrity protocol. If Data Trust Score is Low, pause and fix tracking first — never audit corrupted data.
2. **Quantitative analysis (Day 2–5)**
   - Export funnel, segment, and cohort data; run through `automations/data_parser.js` to produce agent-readable summaries.
   - Data Diagnostics Agent produces the ranked leak report (recoverable $/mo).
3. **Qualitative analysis (Day 4–8)**
   - Configure heatmaps/recordings on the leak pages if not already live (minimum 7 days of collection or 1,000 sessions per page).
   - Run the **UX Behavioral Agent** (`agents/ux_behavioral_agent.md`) against the quant leaks. Triangulate: every finding needs ≥2 evidence sources.
4. **Message scent review (Day 6–8)**
   - Pull top ad creatives by spend; map ad → landing page scent. Audit email/SMS flows against on-site state.
5. **Synthesis (Day 8–10)**
   - Run the **CRO Roadmap Agent** (`agents/cro_roadmap_agent.md`) to produce the ICE-scored Experimentation Matrix.
   - Write the Executive Summary last. Internal review by a second strategist before client delivery.
6. **Delivery**
   - 60-minute live walkthrough. Lead with recoverable revenue, not methodology.

**Quality gate:** No audit ships with unscored recommendations or findings lacking sample sizes.

---

## Phase 2 — Hypothesis Log

**Trigger:** Audit accepted / retainer begins.
**Deliverable:** Living hypothesis log in the client workspace (`clients/{client}/hypothesis_log.md`).

### Steps

1. Transfer every Experimentation Matrix item into the log with: evidence chain, ICE sub-scores, primary metric, guardrails (AOV, refund rate, NC-ROAS), estimated weeks to significance.
2. Add a standing intake: new hypotheses from client team, support tickets, reviews, and post-purchase surveys enter the log — nothing gets tested that isn't logged and scored first.
3. Re-score monthly and after every completed test (learnings shift Confidence).

**Rules**

- Hypothesis format is mandatory: *"Because {evidence}, we believe {change} for {segment} will cause {outcome}, measured by {metric}."*
- No orphan ideas: every entry traces to evidence or is explicitly tagged `heuristic-only` (Confidence ≤ 5).

---

## Phase 3 — Sprint Planning

**Trigger:** Start of each 2-week sprint.
**Deliverable:** Sprint doc with tests in flight, owners, and launch dates.

### Steps

1. **Select** the top ICE items that fit capacity and don't collide (one test per audience/page at a time; pair a long checkout test with quick wins elsewhere).
2. **Brief** each test: variants, copy, design, dev needs, primary metric, decision rule (ship / iterate / kill thresholds), runtime estimate at 95% confidence / 80% power.
3. **Build & QA:** cross-device QA checklist, event tracking verified in preview, guardrail metrics wired into the dashboard *before* launch.
4. **Launch** early in the week (never Friday). Log launch date, traffic allocation, and screenshots of both variants.
5. **Client sync:** 30-minute sprint call — what launched, what's live, what's queued.

**Quality gate:** A test with no pre-registered decision rule does not launch.

---

## Phase 4 — Learning Loop & Dashboard Update

**Trigger:** A test reaches its pre-registered runtime/sample, or sprint end.
**Deliverable:** Test readout + updated client dashboard + re-scored backlog.

### Steps

1. **Analyze:** primary metric at 95% confidence; check guardrails (did CVR win but AOV or refund rate degrade?); segment results (mobile vs. desktop, new vs. returning).
2. **Decide:** Ship / Iterate / Kill per the pre-registered rule. No peeking-based early calls.
3. **Document the learning**, win or lose: what we now know about this audience that we didn't. Losses are findings — a disproven hypothesis prunes a whole branch of the backlog.
4. **Update the dashboard:** tests completed, win rate, cumulative measured impact ($/mo), CVR/AOV/RPS/cart-abandonment trends, LTV cohort movement.
5. **Feed the loop:** re-score affected hypotheses, add follow-up hypotheses spawned by the result, and return to Phase 3.
6. **Quarterly:** re-run a condensed Phase 1 diagnostic — traffic mix, product catalog, and seasonality shift the leak map.

**Quality gate:** No test is closed without a documented learning, and no learning exists only in someone's head.

---

## Roles

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---|---|---|---|---|
| Growth Strategist (lead) | Owns audit & delivery | Owns log | Selects & briefs | Owns readouts |
| Analyst / AI agents | Quant + qual analysis | Scoring support | Runtime estimates | Stats & segments |
| Designer/Developer | — | — | Build & QA | — |
| Account Lead | Client comms | Intake | Sprint sync | Dashboard review |

## Anti-Patterns (do not)

- Testing without fixing a Low Data Trust Score first
- Calling tests early because a client is excited
- Shipping "best practices" changes on leak pages mid-test (contaminates results)
- Reporting relative lift without absolute revenue context
- Letting the hypothesis log go stale — a dead log means the program is coasting
