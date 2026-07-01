// CRO playbook library for DTC brands. Each play maps to a skill in
// this repository (skills/<skill>/SKILL.md) for the full methodology.
'use strict';

const PLAYBOOKS = [
  {
    id: 'hero-value-prop',
    category: 'landing-page',
    title: 'Rewrite the hero around a single customer outcome',
    impact: 'high', effort: 'low',
    description:
      'State the #1 outcome your best customers get, in their own words, in the H1. Support it with one line of proof. Kill slogan-speak.',
    skill: 'page-cro',
  },
  {
    id: 'cta-contrast',
    category: 'landing-page',
    title: 'One primary CTA, repeated down the page',
    impact: 'high', effort: 'low',
    description:
      'Pick a single primary action per page. Make the button high-contrast, action-verb labeled ("Get my plan", not "Submit"), and repeat it after every major section.',
    skill: 'page-cro',
  },
  {
    id: 'social-proof-above-fold',
    category: 'landing-page',
    title: 'Move social proof above the fold',
    impact: 'high', effort: 'low',
    description:
      'Star rating + review count next to the hero CTA. Logos or press mentions directly under the hero. Proof placed before the ask lifts click-through on the primary CTA.',
    skill: 'marketing-psychology',
  },
  {
    id: 'pdp-reviews',
    category: 'product-page',
    title: 'Surface reviews with photos on product pages',
    impact: 'high', effort: 'medium',
    description:
      'Pull the 3 best photo reviews to the top of the review section and add a rating summary near the buy button. Photo reviews convert skeptics that copy cannot.',
    skill: 'marketing-psychology',
  },
  {
    id: 'pdp-shipping-clarity',
    category: 'product-page',
    title: 'Answer shipping & returns next to the buy button',
    impact: 'high', effort: 'low',
    description:
      '"Free shipping over $50 · Free 30-day returns" directly under Add to Cart. Unanswered logistics questions are a top DTC abandonment driver.',
    skill: 'page-cro',
  },
  {
    id: 'checkout-fields',
    category: 'checkout',
    title: 'Cut checkout form fields to the minimum',
    impact: 'high', effort: 'medium',
    description:
      'Remove every field you do not strictly need to fulfill the order. Enable address autocomplete and express wallets (Shop Pay, Apple Pay). Each removed field measurably lifts completion.',
    skill: 'form-cro',
  },
  {
    id: 'cart-progress',
    category: 'checkout',
    title: 'Add a free-shipping progress bar in cart',
    impact: 'medium', effort: 'low',
    description:
      '"You are $12 away from free shipping" raises AOV and completion at once. Pair with 1–2 low-price add-on suggestions.',
    skill: 'marketing-psychology',
  },
  {
    id: 'exit-email',
    category: 'email-capture',
    title: 'Exit-intent offer for first-time visitors',
    impact: 'medium', effort: 'low',
    description:
      'A single exit-intent popup with a concrete incentive (10% off first order) shown once per visitor. Suppress it for returning customers and on checkout pages.',
    skill: 'popup-cro',
  },
  {
    id: 'welcome-flow',
    category: 'email-capture',
    title: 'Three-email welcome flow for new subscribers',
    impact: 'high', effort: 'medium',
    description:
      'Email 1: deliver the incentive + brand story. Email 2: best-sellers with social proof. Email 3: incentive expiry reminder. This flow typically drives outsized first-purchase revenue.',
    skill: 'email-sequence',
  },
  {
    id: 'ab-test-hero',
    category: 'testing',
    title: 'A/B test hero headline: outcome vs. product framing',
    impact: 'high', effort: 'low',
    description:
      'Variant A: what the product is. Variant B: the outcome it delivers. Run to significance on primary-CTA clicks, then on purchases. Use the experiments engine in this platform.',
    skill: 'ab-test-setup',
  },
  {
    id: 'ab-test-pricing-anchor',
    category: 'pricing',
    title: 'Test bundle anchoring on the pricing/PDP',
    impact: 'medium', effort: 'medium',
    description:
      'Introduce a "most popular" bundle at a higher anchor price beside the single unit. Measure AOV and conversion together, not conversion alone.',
    skill: 'pricing-strategy',
  },
  {
    id: 'signup-friction',
    category: 'signup-flow',
    title: 'Delay account creation until after first value',
    impact: 'medium', effort: 'medium',
    description:
      'Allow guest checkout / delayed signup. Ask for the account after the order confirmation, when motivation is highest and friction cost is zero.',
    skill: 'signup-flow-cro',
  },
  {
    id: 'analytics-foundation',
    category: 'measurement',
    title: 'Instrument the full funnel before testing',
    impact: 'high', effort: 'medium',
    description:
      'Track view → add-to-cart → checkout-start → purchase as distinct events with consistent visitor IDs. Without funnel data, every test reads as noise.',
    skill: 'analytics-tracking',
  },
  {
    id: 'post-purchase-referral',
    category: 'retention',
    title: 'Referral ask on the thank-you page',
    impact: 'medium', effort: 'low',
    description:
      'The thank-you page is peak goodwill. Offer a two-sided incentive ("Give $10, get $10") immediately after purchase.',
    skill: 'referral-program',
  },
  {
    id: 'winback-flow',
    category: 'retention',
    title: 'Win-back flow at the repurchase window',
    impact: 'medium', effort: 'medium',
    description:
      'Compute your median repurchase interval and trigger a reminder + incentive email just before customers typically lapse.',
    skill: 'churn-prevention',
  },
];

const CATEGORIES = [...new Set(PLAYBOOKS.map((p) => p.category))];

function list({ category, skill } = {}) {
  let out = PLAYBOOKS;
  if (category) out = out.filter((p) => p.category === category);
  if (skill) out = out.filter((p) => p.skill === skill);
  return out;
}

// Turn failed audit checks into a prioritized plan by linking each
// failed check's skill to matching playbooks.
function fromAudit(report) {
  const failedSkills = new Set(report.checks.filter((c) => !c.passed && c.skill).map((c) => c.skill));
  const impactRank = { high: 0, medium: 1, low: 2 };
  return PLAYBOOKS.filter((p) => failedSkills.has(p.skill)).sort(
    (a, b) => impactRank[a.impact] - impactRank[b.impact]
  );
}

module.exports = { PLAYBOOKS, CATEGORIES, list, fromAudit };
