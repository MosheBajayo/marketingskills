/**
 * Central content model for the consultant portfolio.
 * Edit values here to rebrand the site — copy, metrics, and packages
 * are all driven from this single file.
 *
 * Profile: Moshe Bajayo — Growth Tech Lead & CRO.
 *
 * NOTE: The percentage metrics in `caseStudies`, `audiences`, and
 * `heroStats` are representative of the type of outcome delivered.
 * Swap in your exact, verified figures before publishing.
 */

export const site = {
  name: "Moshe Bajayo",
  role: "Growth & CRO Consultant",
  wordmark: "MB",
  email: "moshe.bajayo@gmail.com",
  phone: "+972-50-881-9822",
  calendarUrl: "#book", // replace with a Calendly / Cal.com embed URL
  tagline: "I turn expensive traffic into predictable revenue.",
  location: "Kfar-Saba, Israel · Working across global markets",
  socials: {
    linkedin: "https://linkedin.com/in/moshe-bajayo",
    x: "https://x.com/",
  },
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * "As seen on" — brands worked with across 7+ years.
 * `note` shows the parent group. To use real logo files, drop SVGs in
 * /public/logos and render them in components/sections/AsSeenOn.tsx.
 */
export const brands = [
  { name: "PepsiCo", note: "Global" },
  { name: "SodaStream", note: "PepsiCo" },
  { name: "Terminal X", note: "Fox Group" },
  { name: "Office Depot", note: "Retail" },
  { name: "Fox Group", note: "Retail" },
  { name: "Lumen", note: "Metaflow" },
] as const;

/** Headline stats used in the hero. */
export const heroStats = [
  { value: "7+", label: "Years scaling growth & CRO" },
  { value: "5+", label: "Global D2C & B2C brands" },
  { value: "Full-funnel", label: "Acquisition → retention" },
];

/** Short credibility / about strip. */
export const about = {
  eyebrow: "Who you're working with",
  title: "A growth leader who ships — not just advises",
  paragraphs: [
    "I'm Moshe Bajayo, a Growth Tech Lead & CRO with 7+ years building and scaling growth across global D2C and B2C eCommerce and subscription platforms.",
    "I currently lead a cross-functional growth team — engineering, QA, data, and design — at Lumen, owning the full funnel from acquisition to retention and embedding AI tools and autonomous agents across it. Before that I drove global DTC growth for SodaStream (PepsiCo) and optimized high-traffic storefronts at Terminal X (Fox Group) and Office Depot.",
    "I combine hands-on technical execution with data-driven strategy. That means you get a partner who can read the analytics, design the experiment, write the copy, and ship the code.",
  ],
  highlights: [
    { value: "Now", label: "Growth Tech Lead & CRO at Lumen" },
    { value: "US · DE", label: "Global DTC markets scaled" },
    { value: "AI-first", label: "LLM agents across the funnel" },
    { value: "Eng · Data · Design", label: "Cross-functional leadership" },
  ],
  toolGroups: [
    {
      label: "CRO & Experimentation",
      tools: ["A/B testing", "VWO", "Dynamic Yield", "Optimizely", "Hotjar"],
    },
    {
      label: "Analytics & BI",
      tools: ["GA4", "SQL", "Python", "Amplitude", "Mixpanel", "Tableau"],
    },
    {
      label: "Growth Stack",
      tools: ["Shopify", "Klaviyo", "Meta Ads", "Claude API", "Figma"],
    },
  ],
} as const;

/** The two core audiences shown in the split-screen selector. */
export const audiences = [
  {
    id: "tech",
    accent: "tech",
    kicker: "Tech · SaaS · Subscription Apps",
    title: "Product-led & subscription growth",
    description:
      "From my work scaling an AI subscription product at Lumen: I optimize the full acquisition-to-retention loop so more signups activate, convert to paid, and stay.",
    bullets: [
      "Sign-up & onboarding funnel optimization",
      "Activation & time-to-value engineering",
      "Subscription pricing, tiers & packaging",
      "Retention, LTV & AI-powered personalization",
    ],
    metrics: [
      { value: "+32%", label: "Sign-up conversion" },
      { value: "+27%", label: "Activation rate" },
      { value: "-19%", label: "Trial-stage churn" },
    ],
    cta: "See SaaS engagements",
  },
  {
    id: "ecom",
    accent: "commerce",
    kicker: "E-commerce · D2C Brands",
    title: "Store experiences that convert",
    description:
      "The world I grew up in — SodaStream, Terminal X, Office Depot. From the product page to the final tap of checkout, I remove friction and add persuasion where it moves revenue per session.",
    bullets: [
      "PDP & collection page optimization",
      "Checkout & cart abandonment recovery",
      "Average order value & bundling strategy",
      "Localization & on-site personalization",
    ],
    metrics: [
      { value: "+24%", label: "Checkout completion" },
      { value: "+18%", label: "Average order value" },
      { value: "-21%", label: "Cart abandonment" },
    ],
    cta: "See D2C engagements",
  },
] as const;

/** The 4-step engagement framework. */
export const framework = [
  {
    step: "01",
    title: "Research & Analytics",
    description:
      "Quantitative and qualitative deep-dive — funnel analytics, session replays, heatmaps, surveys, and customer interviews — to find where and why revenue leaks.",
    tags: ["GA4 · Amplitude", "Hotjar", "SQL · Tableau"],
  },
  {
    step: "02",
    title: "Hypothesis & ICE Prioritization",
    description:
      "Every insight becomes a testable hypothesis, scored by Impact, Confidence, and Effort so we always ship the highest-leverage experiment next.",
    tags: ["ICE scoring", "Test roadmap", "Forecasting"],
  },
  {
    step: "03",
    title: "Wireframing & Copy",
    description:
      "Conversion-first wireframes and persuasive, research-backed copy — designed to be built fast and to change behavior, not just look good.",
    tags: ["Figma", "Conversion copy", "Design specs"],
  },
  {
    step: "04",
    title: "Testing & Iteration",
    description:
      "Statistically rigorous A/B tests, clean readouts, and a compounding learning library. Winners ship, losers teach, and the roadmap keeps improving.",
    tags: ["VWO · Optimizely", "Dynamic Yield", "Stat significance"],
  },
] as const;

/**
 * Case study / testimonial teasers — grounded in real engagements.
 * Metrics are representative; confirm exact figures before publishing.
 */
export const caseStudies = [
  {
    metric: "New tiers",
    metricLabel: "CRO-driven subscription pricing",
    audience: "SaaS",
    accent: "tech",
    summary:
      "At Lumen, repositioned the homepage from weight-loss to metabolic-optimization and launched new entry and annual subscription tiers with CRO-driven pricing and messaging.",
    company: "Lumen · AI subscription app",
  },
  {
    metric: "US + DE",
    metricLabel: "Global DTC growth",
    audience: "D2C",
    accent: "commerce",
    summary:
      "Led global eCommerce growth for SodaStream, building localized shopping journeys and running experimentation programs to lift conversion across US and German markets.",
    company: "SodaStream · PepsiCo",
  },
  {
    metric: "High-traffic",
    metricLabel: "Storefront optimization",
    audience: "D2C",
    accent: "commerce",
    summary:
      "Owned performance, speed, and functionality on a high-traffic storefront at Terminal X, running A/B tests and technical enhancements that improved UX and conversion.",
    company: "Terminal X · Fox Group",
  },
  {
    metric: "Full journey",
    metricLabel: "Conversion optimization",
    audience: "D2C",
    accent: "commerce",
    summary:
      "Managed the eCommerce channel at Office Depot — merchandising, roadmap, and conversion optimization across the customer journey, prioritizing high-impact growth initiatives.",
    company: "Office Depot",
  },
] as const;

export const testimonials = [
  {
    quote:
      "Moshe doesn't guess. Every recommendation came with data behind it and a test to prove it. He reads the analytics, designs the experiment, and ships it — a rare full-stack growth operator.",
    name: "Product Leadership",
    company: "Global D2C brand",
  },
  {
    quote:
      "He rebuilt how we approached experimentation on a high-traffic store. Within weeks we had a rigorous testing program and measurable lifts in conversion. Genuinely embedded, not just advising.",
    name: "eCommerce Leadership",
    company: "Retail group",
  },
];

/** Service packages on the Services page. */
export const packages = [
  {
    id: "audit",
    name: "Growth & CRO Audit",
    price: "One-time",
    tagline: "A high-impact teardown of your funnel.",
    description:
      "A deep, structured audit of your entire conversion journey. You get a prioritized roadmap of experiments — ready for your team to run, or for us to run together.",
    features: [
      "Full funnel & analytics review",
      "Heatmap, session & heuristic analysis",
      "20–30 prioritized, ICE-scored opportunities",
      "Conversion copy & UX recommendations",
      "90-minute findings & roadmap workshop",
      "Loom walkthrough of every recommendation",
    ],
    cta: "Book an audit",
    featured: false,
  },
  {
    id: "fractional",
    name: "Fractional Growth / CRO Lead",
    price: "Monthly retainer",
    tagline: "Continuous, compounding experimentation.",
    description:
      "I embed with your team as your growth lead — owning the testing roadmap end to end. Research, hypotheses, wireframes, copy, QA, and readouts, every single week.",
    features: [
      "Everything in the Audit, ongoing",
      "Managed A/B testing program",
      "Weekly experiment velocity & readouts",
      "Wireframes & conversion copy delivered",
      "AI tooling & automation for growth",
      "Direct Slack access & quarterly strategy",
    ],
    cta: "Discuss a retainer",
    featured: true,
  },
  {
    id: "advisory",
    name: "Advisory & Team Training",
    price: "Strategic",
    tagline: "Level up your internal team.",
    description:
      "Strategic advisory for founders, C-level, and product teams who want to build an experimentation culture in-house. I make your team dangerous, not dependent.",
    features: [
      "Experimentation program design",
      "Workshops for product & growth teams",
      "ICE prioritization & process setup",
      "Analytics, tooling & AI guidance",
      "Monthly leadership advisory calls",
      "Playbooks & internal documentation",
    ],
    cta: "Explore advisory",
    featured: false,
  },
] as const;

export const faqs = [
  {
    q: "How quickly will I see results?",
    a: "Audits deliver a prioritized roadmap within 2–3 weeks. For retainers, most teams see their first statistically significant win within the first 4–6 weeks, with impact compounding from there.",
  },
  {
    q: "Do you work with both SaaS and e-commerce?",
    a: "Yes — I've done both at scale. Subscription and product-led SaaS (Lumen) and global D2C eCommerce (SodaStream, Terminal X, Office Depot). The disciplines rhyme; the levers differ, and I bring dedicated playbooks for each.",
  },
  {
    q: "What tools do you work in?",
    a: "I'm tool-agnostic and meet you where you are: GA4, Amplitude, Mixpanel, SQL/Python, Hotjar, VWO, Dynamic Yield, Optimizely, Shopify, Klaviyo — plus modern AI tooling and LLM agents to accelerate the work.",
  },
  {
    q: "What do you need from my team?",
    a: "Analytics access, a point of contact, and developer/design bandwidth to ship winning tests. For retainers we set a shared, realistic experiment velocity up front — and I can often ship changes myself.",
  },
];

export const bottlenecks = [
  "Low sign-up / conversion rate",
  "Weak activation or onboarding",
  "High cart / checkout abandonment",
  "Low average order value",
  "Churn or retention issues",
  "Pricing & packaging",
  "Not sure — need a diagnosis",
];
