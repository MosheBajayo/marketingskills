import type { Plan, Benefit, FaqItem, Testimonial } from "./types";

// Asset URLs reused from the existing project. Keep stable so images render.
export const ASSETS = {
  hero: {
    desktop:
      "https://src.metaflow.co/Pages/Shop%20New%20V/Phone-Lumen-1671710046.png",
    mobile:
      "https://src.metaflow.co/Pages/Shop%20New%20V/Lumen-phone-1671710058.png",
  },
  realtime: {
    desktop:
      "https://src.metaflow.co/Pages/Shop%20New%20V/Women-Phone-2-1671712563.png",
    mobile:
      "https://src.metaflow.co/Pages/Shop%20New%20V/Group%20671238978-1671712582.png",
  },
  nutrition: {
    desktop:
      "https://src.metaflow.co/Pages/Shop%20New%20V/Women-Phone-1671712571.png",
    mobile:
      "https://src.metaflow.co/Pages/Shop%20New%20V/Group%20671238981-1671712585.png",
  },
  founders: {
    desktop:
      "https://src.metaflow.co/Pages/Shop%20New%20V/M%26M-1671974594.png",
    mobile:
      "https://src.metaflow.co/Pages/Shop%20New%20V/sec6-1671974586.png",
  },
  badge:
    "https://src.metaflow.co/Pages/Shop%20New%20V/badge-1671972580.png",
  reviews: {
    bernadette:
      "https://src.metaflow.co/Pages/Shop%20New%20V/review%201-1671977598.png",
    anthony:
      "https://src.metaflow.co/Pages/Shop%20New%20V/lumen-reviews-anthony%25201_cropped_380x380.png",
  },
} as const;

export const NAV_LINKS = [
  { label: "Shop", href: "#" },
  { label: "How it Works", href: "#" },
  { label: "Science", href: "#" },
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
];

// Three pricing cards exactly as shown in the screenshots: $249 / $299 / $349.
export const PLANS: Plan[] = [
  {
    name: "METABOLISM RESET",
    duration: "3 Month Track",
    price: "$249",
    info: "",
    description: "",
    link: "#",
    badge: null,
    highlighted: false,
  },
  {
    name: "METABOLISM BOOSTER",
    duration: "6 Month Track",
    price: "$299",
    info: "",
    description: "",
    link: "#",
    badge: null,
    highlighted: true,
  },
  {
    name: "METABOLISM OPTIMIZER",
    duration: "12 Month Track",
    price: "$349",
    info: "",
    description: "",
    link: "#",
    badge: null,
    highlighted: false,
  },
];

export const HERO_FEATURES = [
  "Sleek & compact design",
  "iOS and Android app",
  "High-precision CO₂ sensor",
  "Travel Case",
];

export const REALTIME_FEATURES = [
  "Unlimited measurements",
  "Activity & deep tracking",
  "Metabolic health indicator",
  "Workout optimization insights",
];

export const NUTRITION_FEATURES = [
  "Daily personalized nutrition plan",
  "Meal suggestions and recipes",
  "Intermittent fasting insights",
  "Metabolic food log",
];

export const INTEGRATIONS = [
  "Apple Health",
  "Google Fit",
  "Garmin",
  "Fitbit",
];

export const TRUST_BADGES = [
  {
    title: "60-day Returns",
    description: "",
    icon: "RotateCcw",
  },
  {
    title: "Metabolic Expert Support",
    description: "",
    icon: "Headphones",
  },
  {
    title: "Free US Shipping",
    description: "",
    icon: "Truck",
  },
];

export const BENEFITS: Benefit[] = [
  {
    title: "Natural Weight Loss",
    content:
      "Lumen helps improve your metabolic flexibility, which allows you to lose weight in a sustainable way",
    icon: "TrendingDown",
  },
  {
    title: "Less Snacking",
    content:
      "Lumen helps you improve your body's ability to burn fat which decreases your hunger levels and makes you body less dependent on snacking",
    icon: "Apple",
  },
  {
    title: "Boosted Energy Mood",
    content:
      "Increase your energy levels by developing a high-functioning metabolism",
    icon: "Zap",
  },
  {
    title: "Improved Overall Health",
    content:
      "Lumen helps improve your metabolic flexibility, your body's efficiency in shifting between using fats and carbs",
    icon: "Heart",
  },
  {
    title: "Enhanced Weight Maintenance",
    content:
      "Developing a flexible metabolism allows your body to maintain a healthy weight by optimizing the body's ability to burn fat",
    icon: "ShieldCheck",
  },
];

export const FAQ: FaqItem[] = [
  {
    question: "How will metabolic flexibility improve my health?",
    answer:
      "Your metabolism powers everything that happens in your body. By training it to be more flexible — switching easily between burning carbs and fat — you can improve weight, energy, sleep, and overall well-being.",
  },
  {
    question: "How does Lumen measure my metabolism?",
    answer:
      "Lumen uses a high-precision CO₂ sensor and flow meter to measure the CO₂ concentration in a single breath. That tells you whether your body is currently burning carbs or fat for fuel.",
  },
  {
    question: "Can Lumen help me lose weight?",
    answer:
      "Yes. A more flexible metabolism makes it easier to lose weight, and Lumen pairs your daily measurement with a personalized nutrition plan that supports healthy, sustainable weight loss.",
  },
  {
    question: "Is Lumen good value?",
    answer:
      "A single lab-grade metabolic test can cost $300+ and takes 45 minutes. Lumen gives you the same insight from home in under a minute, every day, plus a daily plan to act on it.",
  },
  {
    question: "Is Lumen the same as Keto?",
    answer:
      "No. Lumen isn't about cutting out carbs — it's about training your body to switch efficiently between burning carbs and fat, while still eating a balanced diet.",
  },
  {
    question: "Has Lumen's technology been validated?",
    answer:
      "Yes. Lumen has been validated in peer-reviewed studies and shown to be as accurate as the gold standard for measuring Respiratory Exchange Rate (RER).",
  },
  {
    question: "Is Lumen considered a medical device?",
    answer:
      "No. Lumen is a wellness product. It does not diagnose, treat, cure, or prevent any disease, and it is not a substitute for medical advice.",
  },
  {
    question: "What's the return policy?",
    answer:
      "If Lumen isn't right for you, return it within 30 days of receiving it for a full refund.",
  },
  {
    question: "How long is the warranty?",
    answer:
      "Your Lumen device is covered by a one-year limited warranty against manufacturing defects. Accidental damage isn't covered.",
  },
  {
    question: "Who is Lumen for?",
    answer:
      "Lumen is for adults age 16 and up who want to improve their metabolic flexibility. It is not recommended for people with diabetes, severe asthma, COPD, or those who are pregnant.",
  },
];

export const FOUNDERS = {
  quote:
    "We started Lumen because we believe everyone should have access to the insights they need to understand their body and optimize their health.",
  tagline:
    "It's our life's work — and we love every minute of it.",
  attribution: "Drs. Michal & Merav Mor",
};

export const NEWSLETTER = {
  title: "Sign up to our newsletter and receive $25 off",
  body: "",
};

export const VIDEO_TESTIMONIAL: Testimonial = {
  name: "Bernadette",
  title: "Bernadette lost 15 lbs and broke through her plateau",
  quote:
    "It's crazy. I use it like I use a scale. I've come to rely on it every day. Lumen has transformed my life.",
  imageAlt: "Bernadette video thumbnail",
};

export const DAVE_TESTIMONIAL: Testimonial = {
  name: "Dave Asprey",
  title: "Founder of Bulletproof Nutrition",
  quote:
    "Being able to maintain your weight effortlessly is pretty cool… it's effortless because of a flexible metabolism.",
  imageAlt: "Dave Asprey video thumbnail",
};

export const FOOTER = {
  columns: [
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Metabolic Meaning", href: "#" },
        { label: "Influencer Program", href: "#" },
        { label: "Affiliate program", href: "#" },
        { label: "Lumen Blog", href: "#" },
      ],
    },
    {
      title: "Partner",
      links: [
        { label: "Research with Lumen", href: "#" },
        { label: "Health Professionals", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Accessibility", href: "#" },
      ],
    },
  ],
};
