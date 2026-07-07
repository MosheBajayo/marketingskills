# Moshe Bajayo — Growth & CRO Portfolio

A high-converting, dark-mode portfolio site for **Moshe Bajayo**, a Growth &
CRO consultant with 7+ years scaling two audiences: **Tech/SaaS &
subscription** and **D2C e-commerce** (PepsiCo/SodaStream, Fox Group/Terminal
X, Office Depot, Lumen).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**,
**Framer Motion**, and **Lucide React**.

> **Content note:** The percentage metrics in `lib/content.ts`
> (`heroStats`, `audiences`, `caseStudies`) are *representative* of the type
> of outcome delivered. Swap in exact, verified figures before publishing.
> The `brands` list drives the "As seen on" logo wall — drop real SVG logos
> in `/public/logos` to replace the text wordmarks.

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
│   ├── globals.css         # Design tokens, grid/dots utilities
│   ├── page.tsx            # Homepage (hero, split, framework, cases, CTA)
│   ├── services/page.tsx   # 3 packages + FAQ
│   └── contact/page.tsx    # Booking form + discovery fields
├── components/
│   ├── ui/                 # Button, Container, Badge, Reveal, SectionHeading
│   ├── layout/             # Navbar (mobile menu), Footer
│   └── sections/           # Hero, AsSeenOn, About, AudienceSplit, Framework,
│                           #   CaseStudies, CTA, ContactForm
├── lib/
│   ├── content.ts          # 👈 All copy, metrics, packages, FAQs (edit here)
│   └── utils.ts            # cn() class merge helper
└── tailwind.config.ts      # Design system (ink / signal / tech / commerce)
```

## Customizing

- **All copy, names, metrics, packages, and FAQs** live in
  [`lib/content.ts`](./lib/content.ts). Change the consultant name, email,
  stats, and case studies there — the whole site updates.
- **Colors** are defined in `tailwind.config.ts`:
  - `ink` — near-black backgrounds and surfaces
  - `signal` — primary brand green (growth / revenue)
  - `tech` — sky/cyan accent for the SaaS audience
  - `commerce` — amber accent for the D2C audience
- **The contact form** (`components/sections/ContactForm.tsx`) currently
  simulates submission. Wire `handleSubmit` to your backend (Resend,
  Formspree, HubSpot, etc.), or drop a Calendly/Cal.com embed on the
  `/contact` page and point `site.calendarUrl` at it.

## Design notes

- High-contrast dark theme with a faint blueprint grid, subtle glow accents,
  and a data-driven, monospace-inflected type system (Inter + JetBrains Mono).
- Accessible focus states, `prefers-reduced-motion` support, semantic
  landmarks, and responsive mobile navigation.
- The homepage **Audience Selector** is an interactive segmented control that
  swaps tailored copy and metrics per audience with animated transitions.
