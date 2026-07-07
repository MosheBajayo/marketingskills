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
    "Three ways to work together: a one-time Growth & CRO Audit, a Fractional Growth/CRO Lead retainer, or Advisory & Team Training.",
};

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-ink-700/70">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-signal-500/10 blur-[130px]" />
        <Container className="relative py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="flex justify-center">
                <Badge>Engagements built around outcomes</Badge>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Three ways to{" "}
                <span className="gradient-text">work together</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400">
                Whether you need a one-time diagnosis, an embedded operator, or
                to level up your own team — every engagement runs on the same
                rigorous, revenue-first framework.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Packages */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 0.08}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-4xl border p-8 backdrop-blur transition-all duration-300",
                    pkg.featured
                      ? "border-signal-500/50 bg-ink-900/80 shadow-glow"
                      : "border-ink-700/70 bg-ink-900/50 hover:-translate-y-1 hover:border-ink-600",
                  )}
                >
                  {pkg.featured && (
                    <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-signal-gradient px-3 py-1 text-xs font-semibold text-ink-950">
                      <Sparkles className="h-3.5 w-3.5" />
                      Most popular
                    </span>
                  )}

                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                      {pkg.price}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      {pkg.name}
                    </h2>
                    <p
                      className={cn(
                        "mt-2 text-sm font-medium",
                        pkg.featured ? "text-signal-300" : "text-slate-400",
                      )}
                    >
                      {pkg.tagline}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                      {pkg.description}
                    </p>
                  </div>

                  <ul className="mt-7 flex-1 space-y-3">
                    {pkg.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-slate-300"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal-400" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    href="/contact"
                    variant={pkg.featured ? "primary" : "secondary"}
                    className="mt-8 w-full"
                  >
                    {pkg.cta}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <p className="mt-8 text-center text-sm text-slate-500">
              Not sure which fits? Book a call and I&apos;ll recommend the
              right starting point — no pressure.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-ink-700/70 bg-ink-900/30 py-20 sm:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Questions"
            title="What clients usually ask"
          />
          <div className="mx-auto mt-12 max-w-3xl divide-y divide-ink-700/70 overflow-hidden rounded-3xl border border-ink-700/70 bg-ink-900/50">
            {faqs.map((faq) => (
              <details key={faq.q} className="group px-6 py-5 [&_summary]:list-none">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-base font-medium text-white">
                  {faq.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink-600 text-slate-400 transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <div className="pt-24">
        <CTA
          title="Ready to make revenue predictable?"
          description="Book a strategy audit and get a preview of the experiments I'd run — before you commit to any package."
        />
      </div>
    </>
  );
}
