import type { Metadata } from "next";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/sections/CTA";
import { packages, faqs } from "@/lib/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Three ways to work with Bajayo Growth: a one-time Growth & CRO Audit, a Fractional Growth/CRO Lead retainer, or Advisory & Team Training.",
};

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full bg-volt-500/10 blur-[150px]" />
        <Container className="relative py-20 sm:py-24">
          <Reveal>
            <Badge>Engagements built around outcomes</Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-8 max-w-4xl font-display text-5xl font-bold uppercase leading-[0.9] tracking-tightest text-white sm:text-7xl">
              Three ways to{" "}
              <span className="text-volt-500">work together</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-400">
              Whether you need a one-time diagnosis, an embedded growth team,
              or to level up your own people — every engagement runs on the
              same rigorous, revenue-first framework.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Packages */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid items-stretch gap-px border border-white/10 bg-white/10 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 0.07}>
                <div
                  className={cn(
                    "relative flex h-full flex-col p-8 transition-colors duration-300 sm:p-10",
                    pkg.featured
                      ? "bg-carbon-900"
                      : "bg-carbon-950 hover:bg-carbon-900",
                  )}
                >
                  {pkg.featured && (
                    <span className="absolute right-0 top-0 inline-flex items-center gap-1.5 bg-volt-500 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-carbon-950">
                      <Sparkles className="h-3 w-3" />
                      Most popular
                    </span>
                  )}

                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                      {pkg.price}
                    </p>
                    <h2 className="mt-4 font-display text-3xl font-bold uppercase leading-none tracking-tight text-white">
                      {pkg.name}
                    </h2>
                    <p
                      className={cn(
                        "mt-3 font-mono text-xs uppercase tracking-[0.15em]",
                        pkg.featured ? "text-volt-500" : "text-neutral-400",
                      )}
                    >
                      {pkg.tagline}
                    </p>
                    <p className="mt-5 text-sm leading-relaxed text-neutral-400">
                      {pkg.description}
                    </p>
                  </div>

                  <ul className="mt-8 flex-1 space-y-3.5">
                    {pkg.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-neutral-300"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt-500" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    href="/contact"
                    variant={pkg.featured ? "primary" : "secondary"}
                    className="mt-9 w-full"
                  >
                    {pkg.cta}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <p className="mt-8 text-center font-mono text-xs uppercase tracking-[0.15em] text-neutral-500">
              Not sure which fits? Book a call and we&apos;ll recommend the
              right starting point — no pressure.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 bg-carbon-900/40 py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Questions" title="What clients ask" />
          <div className="mt-12 max-w-3xl divide-y divide-white/10 border border-white/10 bg-carbon-950">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group px-6 py-5 [&_summary]:list-none"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-display text-base font-semibold uppercase tracking-tight text-white">
                  {faq.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-white/15 text-neutral-400 transition-transform duration-300 group-open:rotate-45 group-open:border-volt-500/50 group-open:text-volt-500">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <CTA
        title="Ready to make revenue predictable?"
        description="Book a strategy audit and get a preview of the experiments we'd run — before you commit to any package."
      />
    </>
  );
}
