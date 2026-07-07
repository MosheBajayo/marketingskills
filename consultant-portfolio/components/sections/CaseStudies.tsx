import { ArrowUpRight, Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { caseStudies, testimonials } from "@/lib/content";
import { cn } from "@/lib/utils";

const accentText = {
  tech: "text-tech-400",
  commerce: "text-commerce-400",
} as const;

const accentChip = {
  tech: "border-tech-500/30 bg-tech-500/10 text-tech-300",
  commerce: "border-commerce-500/30 bg-commerce-500/10 text-commerce-300",
} as const;

export function CaseStudies() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Proof, not promises"
            title="Results that show up on the P&L"
            description="A sample of the outcomes from recent SaaS and D2C engagements. Every number came from a controlled test."
          />
          <Reveal delay={0.1}>
            <Button href="/contact" variant="secondary" className="shrink-0">
              Start your case study
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>

        {/* Metric cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {caseStudies.map((cs, i) => (
            <Reveal key={cs.company} delay={i * 0.07}>
              <div className="group flex h-full flex-col rounded-3xl border border-ink-700/70 bg-ink-900/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-ink-600">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider",
                      accentChip[cs.accent],
                    )}
                  >
                    {cs.audience}
                  </span>
                </div>
                <div className="mt-6">
                  <span
                    className={cn(
                      "text-4xl font-semibold tracking-tight sm:text-5xl",
                      accentText[cs.accent],
                    )}
                  >
                    {cs.metric}
                  </span>
                  <p className="mt-1.5 text-sm font-medium text-slate-300">
                    {cs.metricLabel}
                  </p>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">
                  {cs.summary}
                </p>
                <p className="mt-5 border-t border-ink-700/70 pt-4 text-xs text-slate-500">
                  {cs.company}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <figure className="relative h-full overflow-hidden rounded-3xl border border-ink-700/70 bg-gradient-to-br from-ink-900/80 to-ink-850/40 p-8 backdrop-blur">
                <Quote className="absolute right-6 top-6 h-10 w-10 text-ink-700" />
                <blockquote className="relative text-pretty text-lg leading-relaxed text-slate-200">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-gradient font-mono text-sm font-bold text-ink-950">
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold text-white">
                      {t.name}
                    </span>
                    <span className="block text-slate-500">{t.company}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
