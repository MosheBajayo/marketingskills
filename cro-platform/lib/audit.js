// Heuristic CRO audit engine. Fetches a page and scores it against
// conversion best practices drawn from the marketing skills in this repo
// (page-cro, form-cro, copywriting, marketing-psychology).
// Regex-based HTML analysis — zero dependencies, good enough for heuristics.
'use strict';

const ACTION_WORDS = [
  'get started', 'start free', 'try free', 'buy now', 'shop now', 'add to cart',
  'sign up', 'subscribe', 'get access', 'claim', 'order now', 'book a demo',
  'start trial', 'join now', 'download', 'get yours', 'shop the',
];

const SOCIAL_PROOF_WORDS = [
  'testimonial', 'review', 'rating', 'stars', 'customers', 'trusted by',
  'as seen in', 'featured in', 'loved by', 'happy customers', '5-star', 'verified buyer',
];

const TRUST_WORDS = [
  'guarantee', 'money-back', 'money back', 'free shipping', 'free returns',
  'secure checkout', 'ssl', 'refund', 'warranty', 'satisfaction guaranteed',
  'easy returns', '30-day', '60-day', '90-day',
];

const URGENCY_WORDS = [
  'limited time', 'today only', 'ends soon', 'while supplies last', 'only a few left',
  'sale ends', 'last chance', 'hurry', 'low stock', 'selling fast',
];

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMatches(re, str) {
  const m = str.match(re);
  return m ? m.length : 0;
}

function containsAny(text, words) {
  const lower = text.toLowerCase();
  return words.filter((w) => lower.includes(w));
}

// Analyze raw HTML. Pure function so it is unit-testable without network.
function analyzeHtml(html, url = '') {
  const text = stripTags(html);
  const lowerHtml = html.toLowerCase();
  const checks = [];

  const add = (id, label, passed, weight, detail, skill) => {
    checks.push({ id, label, passed, weight, detail, skill: skill || null });
  };

  // --- Messaging & meta ---
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : '';
  add('title', 'Page title present and descriptive', title.length >= 15 && title.length <= 70, 6,
    title ? `Title (${title.length} chars): "${title.slice(0, 80)}"` : 'No <title> tag found.',
    'copywriting');

  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
  const metaDescContent = metaDesc ? (metaDesc[0].match(/content=["']([^"']*)["']/i) || [])[1] || '' : '';
  add('meta-description', 'Meta description present', metaDescContent.length >= 50, 4,
    metaDescContent ? `${metaDescContent.length} chars.` : 'Missing or too short — hurts CTR from search and social shares.',
    'seo-audit');

  const h1Count = countMatches(/<h1[\s>]/gi, html);
  add('h1', 'Exactly one H1 (clear value proposition)', h1Count === 1, 8,
    `Found ${h1Count} H1 tag(s). The H1 should state the core value proposition in customer language.`,
    'page-cro');

  // --- Calls to action ---
  const buttonsAndLinks = html.match(/<(?:button|a)[^>]*>[\s\S]*?<\/(?:button|a)>/gi) || [];
  const ctaMatches = buttonsAndLinks.filter((el) => containsAny(stripTags(el), ACTION_WORDS).length > 0);
  add('cta-present', 'Action-oriented call to action found', ctaMatches.length > 0, 10,
    ctaMatches.length
      ? `${ctaMatches.length} CTA element(s) with action language (e.g. "${stripTags(ctaMatches[0]).slice(0, 40)}").`
      : 'No buttons/links with action verbs (shop now, add to cart, get started…).',
    'page-cro');

  const aboveFold = html.slice(0, Math.min(html.length, Math.floor(html.length * 0.35)));
  const ctaAboveFold = (aboveFold.match(/<(?:button|a)[^>]*>[\s\S]*?<\/(?:button|a)>/gi) || [])
    .some((el) => containsAny(stripTags(el), ACTION_WORDS).length > 0);
  add('cta-above-fold', 'CTA appears early in the page', ctaAboveFold, 6,
    ctaAboveFold ? 'A primary CTA appears in the first third of the document.'
      : 'No CTA detected early in the document — visitors should never scroll to find the primary action.',
    'page-cro');

  // --- Persuasion elements ---
  const proofHits = containsAny(text, SOCIAL_PROOF_WORDS);
  add('social-proof', 'Social proof present', proofHits.length > 0, 8,
    proofHits.length ? `Signals found: ${proofHits.slice(0, 5).join(', ')}.`
      : 'No testimonials, reviews, ratings, or "trusted by" signals detected.',
    'marketing-psychology');

  const trustHits = containsAny(text, TRUST_WORDS);
  add('trust-signals', 'Risk reversal / trust signals present', trustHits.length > 0, 7,
    trustHits.length ? `Signals found: ${trustHits.slice(0, 5).join(', ')}.`
      : 'No guarantees, free shipping/returns, or secure-checkout messaging detected.',
    'marketing-psychology');

  const urgencyHits = containsAny(text, URGENCY_WORDS);
  add('urgency', 'Urgency or scarcity used', urgencyHits.length > 0, 3,
    urgencyHits.length ? `Signals found: ${urgencyHits.slice(0, 3).join(', ')}.`
      : 'Optional but effective for DTC: limited-time offers, stock indicators.',
    'marketing-psychology');

  // --- Forms & friction ---
  const forms = html.match(/<form[\s\S]*?<\/form>/gi) || [];
  if (forms.length > 0) {
    const maxFields = Math.max(
      ...forms.map((f) => countMatches(/<(?:input(?![^>]*type=["'](?:hidden|submit)["'])|select|textarea)/gi, f))
    );
    add('form-friction', 'Forms are short (≤5 visible fields)', maxFields <= 5, 6,
      `Largest form has ${maxFields} visible field(s). Every extra field costs conversions.`,
      'form-cro');
  } else {
    add('form-friction', 'Forms are short (≤5 visible fields)', true, 6, 'No forms on page.', 'form-cro');
  }

  // --- Media & performance ---
  const images = html.match(/<img[^>]*>/gi) || [];
  const withAlt = images.filter((i) => /alt=["'][^"']+["']/i.test(i));
  add('image-alt', 'Images have alt text', images.length === 0 || withAlt.length / images.length >= 0.8, 3,
    images.length ? `${withAlt.length}/${images.length} images have alt text.` : 'No images found.',
    'seo-audit');

  const scriptCount = countMatches(/<script[\s>]/gi, html);
  add('script-weight', 'Reasonable script count (≤30)', scriptCount <= 30, 4,
    `${scriptCount} script tag(s). Heavy JS slows LCP; every second of load time costs conversions.`,
    'page-cro');

  const sizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);
  add('page-weight', 'HTML document under 400 KB', sizeKb <= 400, 3,
    `Document is ${sizeKb} KB.`, 'page-cro');

  // --- Mobile & platform ---
  add('viewport', 'Mobile viewport meta tag', /<meta[^>]+name=["']viewport["']/i.test(html), 6,
    'Most DTC traffic is mobile; a viewport meta tag is table stakes.', 'page-cro');

  add('https', 'Served over HTTPS', url.startsWith('https://') || !url, 4,
    url ? `URL scheme: ${url.split(':')[0]}.` : 'No URL provided.', 'page-cro');

  const hasSchema = /application\/ld\+json/i.test(lowerHtml) || /itemtype=/i.test(lowerHtml);
  add('schema', 'Structured data (schema.org) present', hasSchema, 2,
    hasSchema ? 'JSON-LD or microdata detected.' : 'Product/review schema improves rich results.',
    'schema-markup');

  const hasEmailCapture = /type=["']email["']/i.test(html);
  add('email-capture', 'Email capture opportunity on page', hasEmailCapture, 3,
    hasEmailCapture ? 'Email input detected.' : 'No email field — DTC brands should capture emails from non-buyers.',
    'popup-cro');

  // Score: weighted percentage of passed checks.
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
  const score = Math.round((earned / totalWeight) * 100);

  const failed = checks.filter((c) => !c.passed).sort((a, b) => b.weight - a.weight);
  return {
    score,
    grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 45 ? 'D' : 'F',
    checks,
    topIssues: failed.slice(0, 5).map((c) => ({ id: c.id, label: c.label, detail: c.detail, skill: c.skill })),
    stats: { htmlKb: sizeKb, scripts: scriptCount, images: images.length, forms: forms.length },
  };
}

// Fetch a URL and run the analysis. Returns an audit record body.
async function runAudit(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; CRO-Platform-Audit/1.0)' },
    });
    const html = await res.text();
    const report = analyzeHtml(html, res.url || url);
    return { url, finalUrl: res.url || url, status: res.status, ok: true, report };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { analyzeHtml, runAudit, stripTags };
