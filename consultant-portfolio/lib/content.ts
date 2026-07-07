/**
 * Central content model for the consultant portfolio.
 * Edit values here to rebrand the site — copy, metrics, and packages
 * are all driven from this single file.
 */

export const site = {
  name: "Jordan Vale",
  role: "Growth & CRO Consultant",
  wordmark: "JV",
  email: "hello@jordanvale.com",
  calendarUrl: "#book", // replace with a Calendly / Cal.com embed URL
  tagline: "I turn expensive traffic into predictable revenue.",
  location: "Remote · Working across US & EU time zones",
  socials: {
    linkedin: "https://linkedin.com/in/",
    x: "https://x.com/",
  },
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
] as const;

/** Logos shown in the "trusted by" marquee (text-only for portability). */
export const clients = [
  "Northbeam",
  "Ramp",
  "Superhuman",
  "Glossier",
  "Vercel",
  "Allbirds",
  "Linear",
  "Warby Parker",
];

/** Headline stats used across hero + about strip. */
export const heroStats = [
  { value: "$120M+", label: "Incremental revenue influenced" },
  { value: "600+", label: "Experiments shipped" },
  { value: "38%", label: "Median lift on primary metric" },
];

/** The two core audiences shown in the split-screen selector. */
export const audiences = [
  {
    id: "tech",
    accent: "tech",
    kicker: "Tech · SaaS · B2B / B2C Apps",
    title: "Product-Led Growth that compounds",
    description:
      "I optimize the entire acquisition-to-activation loop — so more of your hard-won signups reach their first real win and stick around.",
    bullets: [
      "Sign-up & onboarding funnel optimization",
      "Activation & time-to-value engineering",
      "Pricing, packaging & tier experiments",
      "Retention, expansion & churn reduction",
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
      "From the product detail page to the final tap of checkout, I remove friction and add persuasion where it moves the number that matters: revenue per session.",
    bullets: [
      "PDP & collection page optimization",
      "Checkout & cart abandonment recovery",
      "Average order value & bundling strategy",
      "On-site personalization & merchandising",
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
    tags: ["GA4 · Amplitude", "Heatmaps", "User interviews"],
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
    tags: ["Wireframes", "Conversion copy", "Design specs"],
  },
  {
    step: "04",
    title: "Testing & Iteration",
    description:
      "Statistically rigorous A/B tests, clean readouts, and a compounding learning library. Winners ship, losers teach, and the roadmap keeps improving.",
    tags: ["A/B testing", "Stat significance", "Learning library"],
  },
] as const;

/** Case study / testimonial teasers. */
export const caseStudies = [
  {
    metric: "+32%",
    metricLabel: "Lift in sign-ups",
    audience: "SaaS",
    accent: "tech",
    summary:
      "Rebuilt a B2B onboarding funnel around a single activation moment, cutting steps by 40% and lifting completed signups by nearly a third.",
    company: "Series B DevTools platform",
  },
  {
    metric: "-21%",
    metricLabel: "Checkout abandonment",
    audience: "D2C",
    accent: "commerce",
    summary:
      "Redesigned an express checkout with trust signals and dynamic shipping messaging, recovering thousands of carts per month.",
    company: "8-figure apparel brand",
  },
  {
    metric: "+18%",
    metricLabel: "Average order value",
    audience: "D2C",
    accent: "commerce",
    summary:
      "Introduced intelligent bundling and post-add-to-cart upsells that raised AOV without hurting conversion rate.",
    company: "Home & wellness D2C",
  },
  {
    metric: "+27%",
    metricLabel: "Activation rate",
    audience: "SaaS",
    accent: "tech",
    summary:
      "Instrumented the product to find the aha-moment, then re-sequenced onboarding around it to move the activation needle in one quarter.",
    company: "PLG productivity app",
  },
] as const;

export const testimonials = [
  {
    quote:
      "Jordan doesn't guess. Every recommendation came with data behind it and a test to prove it. We shipped more winning experiments in one quarter than in the previous two years.",
    name: "VP of Growth",
    company: "Series B SaaS",
  },
  {
    quote:
      "Our checkout had been the same for years. Within six weeks we had a rigorous testing program and a measurable lift in completed orders. Worth every dollar.",
    name: "Head of E-commerce",
    company: "D2C apparel",
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
      "Direct Slack access & async support",
      "Quarterly strategy & forecasting",
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
      "Analytics & tooling guidance",
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
    a: "Audits deliver a prioritized roadmap within 2–3 weeks. For retainers, most clients see their first statistically significant win within the first 4–6 weeks, with impact compounding from there.",
  },
  {
    q: "Do you work with both SaaS and e-commerce?",
    a: "Yes. The disciplines rhyme — research, prioritization, testing — but the levers differ. I bring dedicated playbooks for product-led SaaS funnels and for D2C storefronts and checkout.",
  },
  {
    q: "What tools do you work in?",
    a: "I'm tool-agnostic and meet you where you are: GA4, Amplitude, Mixpanel, Hotjar, VWO, Optimizely, Shopify, and most modern testing and analytics stacks.",
  },
  {
    q: "What do you need from my team?",
    a: "Analytics access, a point of contact, and developer/design bandwidth to ship winning tests. For retainers we set a shared, realistic experiment velocity up front.",
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
