# Bajayo Growth — Growth & CRO Studio

The website for **Bajayo Growth**, a conversion & experimentation studio for
**Tech/SaaS/subscription**, **DTC e-commerce**, and **B2B2C** brands —
founded by Moshe Bajayo (PepsiCo/SodaStream, Fox Group/Terminal X, Office
Depot, Lumen).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**,
**Framer Motion**, and **Lucide React**. Bold high-contrast design system:
carbon black, volt accent, Space Grotesk display type.

> **Content note:** The percentage metrics in `lib/content.ts`
> (`audiences`) are *representative* of the type of outcome delivered.
> Swap in exact, verified figures before publishing. The `brands` list
> drives the "As seen on" marquee — drop real SVG logos in `/public/logos`
> to replace the text wordmarks, and swap the founder initials tile on
> `/about` for a real portrait.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Project structure

```
consultant-portfolio/
├── app/
│   ├── layout.tsx          # Root layout, fonts, nav + footer, SEO metadata
│   ├── globals.css         # Design tokens, outline-text & dots utilities
│   ├── page.tsx            # Homepage (hero, marquee, split, framework, work, CTA)
│   ├── services/page.tsx   # 3 packages + FAQ
│   ├── about/page.tsx      # Studio story, principles, founder profile
│   └── contact/page.tsx    # Booking form + discovery fields
├── components/
│   ├── ui/                 # Button, Container, Badge, Reveal, SectionHeading
│   ├── layout/             # Navbar (mobile menu), Footer (outline wordmark)
│   └── sections/           # Hero, AsSeenOn, AudienceSplit, Framework,
│                           #   CaseStudies, CTA, ContactForm
├── lib/
│   ├── content.ts          # 👈 All copy, metrics, packages, founder (edit here)
│   └── utils.ts            # cn() class merge helper
└── tailwind.config.ts      # Design system (carbon / volt)
```

## Customizing

- **All copy, brand names, metrics, packages, FAQs, and the founder
  profile** live in [`lib/content.ts`](./lib/content.ts).
- **Colors** are defined in `tailwind.config.ts`:
  - `carbon` — near-black backgrounds and surfaces
  - `volt` — the single vivid accent (#CCFF00)
- **Fonts**: Space Grotesk (display), Inter (body), JetBrains Mono
  (labels/numbers) via `next/font`.
- **The contact form** (`components/sections/ContactForm.tsx`) currently
  simulates submission. Wire `handleSubmit` to your backend (Resend,
  Formspree, HubSpot, etc.), or drop a Calendly/Cal.com embed on the
  `/contact` page and point `site.calendarUrl` at it.

## Design notes

- Bold high-contrast direction: pure black, one volt accent, oversized
  uppercase display type, sharp corners, hairline dividers, hover
  inversions, and marquee motion.
- Accessible focus states, `prefers-reduced-motion` support, semantic
  landmarks, and responsive mobile navigation.
- The homepage **Audience Selector** is an interactive segmented control
  that swaps tailored copy and metrics per audience (Tech/SaaS vs DTC).
