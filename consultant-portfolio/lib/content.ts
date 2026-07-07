/**
 * Central content model for Bajayo Growth — a conversion & experimentation
 * studio. Edit values here to rebrand the site; copy, metrics, packages,
 * and the founder profile are all driven from this single file.
 *
 * NOTE: The percentage metrics in `audiences` are representative of the
 * type of outcome delivered. Swap in exact, verified figures before
 * publishing.
 */

export const site = {
  name: "Bajayo Growth",
  shortName: "BAJAYO",
  role: "Growth & CRO Studio",
  wordmark: "BG",
  email: "moshe.bajayo@gmail.com",
  phone: "+972-50-881-9822",
  calendarUrl: "#book", // replace with a Calendly / Cal.com embed URL
  tagline: "Growth, engineered.",
  location: "Tel Aviv · Working across US & EU markets",
  socials: {
    linkedin: "https://linkedin.com/in/moshe-bajayo",
    x: "https://x.com/",
  },
} as const;

export const nav = [
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Brand marquee — teams and brands our work has shipped for.
 * To use real logo files, drop SVGs in /public/logos and swap the
 * wordmarks in components/sections/AsSeenOn.tsx.
 */
export const brands = [
  { name: "PepsiCo", note: "Global CPG" },
  { name: "SodaStream", note: "PepsiCo" },
  { name: "Terminal X", note: "Fox Group" },
  { name: "Office Depot", note: "Retail" },
  { name: "Fox Group", note: "Retail" },
  { name: "Lumen", note: "Health tech" },
] as const;

/** Headline stats used in the hero. */
export const heroStats = [
  { value: "7+", label: "Years engineering growth & CRO" },
  { value: "6", label: "Global brands scaled" },
  { value: "Full-funnel", label: "Acquisition through retention" },
];

/** The two core audiences shown in the split selector. */
export const audiences = [
  {
    id: "tech",
    kicker: "Tech · SaaS · Subscription · B2B2C",
    title: "Product-led & subscription growth",
    description:
      "We optimize the full acquisition-to-retention loop for software and subscription products — so more signups activate, convert to paid, and stay.",
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
    cta: "Start a SaaS engagement",
  },
  {
    id: "ecom",
    kicker: "E-commerce · DTC · Retail brands",
    title: "Store experiences that convert",
    description:
      "The world we grew up in — SodaStream, Terminal X, Office Depot. From the product page to the final tap of checkout, we remove friction and add persuasion where it moves revenue per session.",
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
    cta: "Start a DTC engagement",
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
      "Every insight becomes a testable hypothesis, scored by Impact, Confidence, and Effort — so the highest-leverage experiment always ships next.",
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
 * Selected work — grounded in real engagements.
 * Metrics are representative; confirm exact figures before publishing.
 */
export const caseStudies = [
  {
    metric: "New tiers",
    metricLabel: "CRO-driven subscription pricing",
    audience: "SaaS",
    summary:
      "Repositioned Lumen's homepage from weight-loss to metabolic-optimization and launched new entry and annual subscription tiers with CRO-driven pricing and messaging.",
    company: "Lumen · AI subscription app",
  },
  {
    metric: "US + DE",
    metricLabel: "Global DTC growth",
    audience: "DTC",
    summary:
      "Led global eCommerce growth for SodaStream — localized shopping journeys and experimentation programs that lifted conversion across US and German markets.",
    company: "SodaStream · PepsiCo",
  },
  {
    metric: "High-traffic",
    metricLabel: "Storefront optimization",
    audience: "DTC",
    summary:
      "Owned performance, speed, and functionality on Terminal X's high-traffic storefront — A/B tests and technical enhancements that improved UX and conversion.",
    company: "Terminal X · Fox Group",
  },
  {
    metric: "Full journey",
    metricLabel: "Conversion optimization",
    audience: "Retail",
    summary:
      "Managed the eCommerce channel at Office Depot — merchandising, roadmap, and conversion optimization across the customer journey, prioritizing high-impact growth initiatives.",
    company: "Office Depot",
  },
] as const;

export const testimonials = [
  {
    quote:
      "They don't guess. Every recommendation came with data behind it and a test to prove it — they read the analytics, design the experiment, and ship it. A rare full-stack growth operation.",
    name: "Product Leadership",
    company: "Global D2C brand",
  },
  {
    quote:
      "They rebuilt how we approached experimentation on a high-traffic store. Within weeks we had a rigorous testing program and measurable lifts in conversion. Genuinely embedded, not just advising.",
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
      "We embed with your team as your growth lead — owning the testing roadmap end to end. Research, hypotheses, wireframes, copy, QA, and readouts, every single week.",
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
      "Strategic advisory for founders, C-level, and product teams who want to build an experimentation culture in-house. We make your team dangerous, not dependent.",
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
    q: "How quickly will we see results?",
    a: "Audits deliver a prioritized roadmap within 2–3 weeks. For retainers, most teams see their first statistically significant win within the first 4–6 weeks, with impact compounding from there.",
  },
  {
    q: "Do you work with both SaaS and e-commerce?",
    a: "Yes — we've done both at scale. Subscription and product-led SaaS (Lumen) and global D2C eCommerce (SodaStream, Terminal X, Office Depot). The disciplines rhyme; the levers differ, and we bring dedicated playbooks for each.",
  },
  {
    q: "What tools do you work in?",
    a: "We're tool-agnostic and meet you where you are: GA4, Amplitude, Mixpanel, SQL/Python, Hotjar, VWO, Dynamic Yield, Optimizely, Shopify, Klaviyo — plus modern AI tooling and LLM agents to accelerate the work.",
  },
  {
    q: "What do you need from our team?",
    a: "Analytics access, a point of contact, and developer/design bandwidth to ship winning tests. For retainers we set a shared, realistic experiment velocity up front — and we can often ship changes ourselves.",
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

/* ------------------------------------------------------------------ */
/* About page                                                          */
/* ------------------------------------------------------------------ */

export const studio = {
  eyebrow: "The studio",
  title: "A growth studio that ships — not just advises",
  paragraphs: [
    "Bajayo Growth is a conversion & experimentation studio for Tech, DTC, and B2B2C brands. We exist for one reason: most companies pay more and more for traffic that converts less and less — and the fix is a discipline, not a redesign.",
    "Our work runs on a single operating system: research the funnel, prioritize by expected impact, ship rigorous experiments, and compound the learning. It's the same system we've run inside global brands — from PepsiCo's DTC arm to high-traffic fashion retail — now available to your team.",
    "We stay deliberately small. Every engagement is led directly by the founder, and we take on a handful of clients at a time so the work gets senior attention from research to readout.",
  ],
  principles: [
    {
      title: "Revenue is the metric",
      description:
        "Not sessions, not scroll depth. Every experiment traces to money — measured in dollars, not opinions.",
    },
    {
      title: "Evidence over taste",
      description:
        "Research and data pick the roadmap. Statistical rigor decides what ships. Losers teach; winners compound.",
    },
    {
      title: "We ship, not just advise",
      description:
        "Analytics, experiment design, copy, wireframes, and code — the work gets done, not handed off as a deck.",
    },
    {
      title: "AI as leverage",
      description:
        "LLM agents and AI tooling across the funnel — research, personalization, and velocity your competitors don't have yet.",
    },
  ],
} as const;

export const founder = {
  name: "Moshe Bajayo",
  role: "Founder & Principal",
  initials: "MB",
  bio: [
    "Moshe founded Bajayo Growth after 7+ years building and scaling growth inside global D2C, B2C, and subscription businesses — most recently as Growth Tech Lead & CRO at Lumen, leading a cross-functional team of engineering, QA, data, and design across the full funnel.",
    "Before that he drove global DTC growth for SodaStream (PepsiCo), owned storefront performance and experimentation at Terminal X (Fox Group), and managed the eCommerce channel at Office Depot.",
    "He combines hands-on technical execution with data-driven strategy — a partner who can read the analytics, design the experiment, write the copy, and ship the code.",
  ],
  experience: [
    {
      company: "Lumen",
      role: "Growth Tech Lead & CRO",
      period: "Now",
      note: "AI-powered metabolic health · subscription",
    },
    {
      company: "SodaStream · PepsiCo",
      role: "Global DTC Growth",
      period: "Previously",
      note: "US & DE markets · localization · experimentation",
    },
    {
      company: "Terminal X · Fox Group",
      role: "eCommerce Optimization",
      period: "Previously",
      note: "High-traffic fashion storefront · A/B testing",
    },
    {
      company: "Office Depot",
      role: "eCommerce Channel Manager",
      period: "Previously",
      note: "Merchandising · roadmap · conversion",
    },
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
