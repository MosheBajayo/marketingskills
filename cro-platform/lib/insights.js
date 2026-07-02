// Full-picture insights engine: cross-references ads spend, attribution,
// funnel behavior, tracking hygiene, and experiment results into a single
// prioritized list of findings. Each insight links to a skill in this
// repo for the methodology to act on it.
'use strict';

// Rough cross-industry paid-social/search benchmarks used for flags.
const BENCHMARKS = {
  minCtr: 0.009,       // <0.9% CTR → creative fatigue territory
  goodRoas: 3,         // ≥3x → scale candidate
  breakEvenRoas: 1,    // <1x → losing money
  maxUntaggedShare: 0.35, // >35% direct/untagged while running paid → tagging problem
};

const SEVERITY_RANK = { bad: 0, warn: 1, good: 2, info: 3 };

// inputs: {channels (last-touch channelReport), funnel (funnelReport),
//          campaigns, experiments, experimentResults: Map<id, results>,
//          personalizations, personalizationResults: Map<id, results>}
function generateInsights({
  channels, funnel, campaigns = [], experiments = [], experimentResults = new Map(),
  personalizations = [], personalizationResults = new Map(),
}) {
  const insights = [];
  const add = (severity, title, detail, skill) => insights.push({ severity, title, detail, skill: skill || null });

  const rows = channels ? channels.rows : [];
  const totals = channels ? channels.totals : null;
  const hasSpend = rows.some((r) => r.hasSpend);

  // ---- Ads performance ----
  for (const r of rows) {
    if (!r.hasSpend) continue;
    const label = `${r.source} / ${r.medium} / ${r.campaign}`;
    if (r.spend > 0 && r.visitors === 0) {
      add('bad', `Spend with zero tracked visitors: ${label}`,
        `$${r.spend} spent but no sessions attributed. UTMs on the ads likely don't match (source=${r.source}, medium=${r.medium}, campaign=${r.campaign}) — fix the tracking template before judging the campaign.`,
        'analytics-tracking');
      continue;
    }
    if (r.roas != null && r.roas < BENCHMARKS.breakEvenRoas && r.spend >= 100) {
      add('bad', `Losing money on ${label} (ROAS ${r.roas}x)`,
        `$${r.spend} spend → $${r.revenue} revenue${r.cpa != null ? `, CPA $${r.cpa}` : ''}. Cut it, or fix the landing experience first: CVR here is ${pct(r.cvr)} — run a CRO audit on its landing page before adding budget.`,
        'paid-ads');
    } else if (r.roas != null && r.roas >= BENCHMARKS.goodRoas && r.spend >= 100) {
      add('good', `Scale candidate: ${label} (ROAS ${r.roas}x)`,
        `$${r.spend} spend → $${r.revenue} revenue at ${pct(r.cvr)} CVR. Increase budget in ~20% steps while watching CPA, and spin up creative variations before fatigue sets in.`,
        'paid-ads');
    }
    if (r.ctr != null && r.ctr < BENCHMARKS.minCtr && r.impressions >= 5000) {
      add('warn', `Low CTR on ${label} (${pct(r.ctr)})`,
        `${r.clicks.toLocaleString()} clicks from ${r.impressions.toLocaleString()} impressions. Below ~0.9% usually means creative fatigue or poor audience match — refresh creative angles.`,
        'ad-creative');
    }
    if (r.cpa != null && r.aov != null && r.cpa > r.aov) {
      add('warn', `CPA exceeds AOV on ${label} ($${r.cpa} vs $${r.aov})`,
        'First-order economics are negative. Either raise AOV (bundles, free-shipping threshold) or this channel must pay back on repeat purchases — check retention before scaling.',
        'pricing-strategy');
    }
  }

  // ---- Tracking hygiene ----
  if (totals && totals.visitors > 0 && hasSpend) {
    const direct = rows.find((r) => r.source === 'direct');
    const untaggedShare = direct ? direct.visitors / totals.visitors : 0;
    if (untaggedShare > BENCHMARKS.maxUntaggedShare) {
      add('warn', `${pct(untaggedShare)} of traffic is direct/untagged`,
        'You are buying ads but a large share of sessions carry no attribution. Add UTM parameters to every paid placement, email, and social link — otherwise winners and losers are indistinguishable.',
        'analytics-tracking');
    }
  }
  if (totals && totals.spend > 0 && totals.revenue === 0 && totals.conversions > 0) {
    add('warn', 'Conversions have no revenue values',
      'Conversions are tracked without order values, so ROAS cannot be computed. Pass revenue: CRO.convert("purchase", {value: orderTotal}).',
      'analytics-tracking');
  }

  // ---- Funnel ----
  if (funnel && funnel.leak && funnel.leak.loss > 0.5) {
    const leakSkill = {
      'add_to_cart': 'page-cro',
      'begin_checkout': 'page-cro',
      'purchase': 'form-cro',
    }[funnel.leak.to] || 'page-cro';
    const stage = funnel.stages.find((s) => s.id === funnel.leak.to);
    add('warn', `Biggest funnel leak: ${funnel.leak.from} → ${funnel.leak.to} (${pct(funnel.leak.loss)} drop)`,
      `Only ${pct(stage && stage.stepRate)} of visitors advance at this step. This is where a CRO experiment has the most leverage right now.`,
      leakSkill);
  }

  // ---- Experiments ----
  for (const exp of experiments) {
    if (exp.status !== 'running') continue;
    const results = experimentResults.get(exp.id);
    if (!results) continue;
    if (results.srm && results.srm.srm) {
      add('bad', `SRM detected in "${exp.name}"`,
        `Traffic split doesn't match variant weights (p=${results.srm.pValue}). Results are unreliable — check that the snippet runs on every targeted page and no redirect drops a variant.`,
        'ab-test-setup');
      continue;
    }
    const winner = results.comparisons.find((c) => c.vsControl && c.vsControl.significant && c.vsControl.uplift > 0);
    const loser = results.comparisons.find((c) => c.vsControl && c.vsControl.significant && c.vsControl.uplift < 0);
    if (winner) {
      const v = results.variants.find((x) => x.id === winner.variantId);
      add('good', `"${exp.name}" has a significant winner: ${v ? v.name : winner.variantId}`,
        `+${(winner.vsControl.uplift * 100).toFixed(1)}% lift at p=${winner.vsControl.pValue.toFixed(4)}. Ship the winner, then re-test the next boldest variant.`,
        'ab-test-setup');
    } else if (loser) {
      add('warn', `"${exp.name}" variant is significantly losing`,
        `${(loser.vsControl.uplift * 100).toFixed(1)}% at p=${loser.vsControl.pValue.toFixed(4)}. Stop sending traffic to the losing variant.`,
        'ab-test-setup');
    }
  }
  // ---- Personalizations ----
  for (const px of personalizations) {
    if (px.status !== 'running') continue;
    const r = personalizationResults.get(px.id);
    if (!r || !r.vsHoldback) continue;
    if (r.vsHoldback.significant && r.vsHoldback.uplift > 0) {
      add('good', `Personalization "${px.name}" is lifting conversions`,
        `+${(r.vsHoldback.uplift * 100).toFixed(1)}% vs the ${px.holdback}% holdback control (p=${r.vsHoldback.pValue.toFixed(4)}). Consider rolling it out to 100% (holdback 0) or expanding the audience.`,
        'page-cro');
    } else if (r.vsHoldback.significant && r.vsHoldback.uplift < 0) {
      add('bad', `Personalization "${px.name}" is hurting conversions`,
        `${(r.vsHoldback.uplift * 100).toFixed(1)}% vs holdback (p=${r.vsHoldback.pValue.toFixed(4)}). Stop it — the targeted experience performs worse than the default.`,
        'page-cro');
    }
  }

  const running = experiments.filter((e) => e.status === 'running').length;
  if (running === 0 && totals && totals.visitors > 500) {
    add('info', 'No experiments running',
      `You have ${totals.visitors.toLocaleString()} tracked visitors and no active test. That traffic is unpriced learning — always be running one experiment on your highest-leverage page.`,
      'ab-test-setup');
  }

  // ---- Blended picture ----
  if (totals && totals.spend > 0 && totals.roas != null) {
    add('info', `Blended performance: ${totals.roas}x ROAS, ${pct(totals.cvr)} CVR`,
      `$${totals.spend.toLocaleString()} total spend → $${totals.revenue.toLocaleString()} revenue from ${totals.conversions.toLocaleString()} conversions${totals.cpa != null ? ` (blended CPA $${totals.cpa})` : ''}. Judge channels against this baseline, not against zero.`,
      'revops');
  }

  insights.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  return insights;
}

function pct(n) {
  return n == null ? '—' : (n * 100).toFixed(1) + '%';
}

module.exports = { generateInsights, BENCHMARKS };
