import { ArrowUpRight, Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { caseStudies, testimonials } from "@/lib/content";

export function CaseStudies() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="03 — Selected work"
            title="Proof, not promises"
            description="A sample of real engagements across SaaS/subscription and global DTC. Specific performance figures shared on request or under NDA."
          />
          <Reveal delay={0.1}>
            <Button href="/contact" variant="secondary" className="shrink-0">
              Start your case study
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>

        {/* Work cards */}
        <div className="mt-14 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {caseStudies.map((cs, i) => (
            <Reveal key={cs.company} delay={i * 0.06}>
              <div className="group flex h-full flex-col bg-carbon-950 p-7 transition-colors duration-300 hover:bg-carbon-900">
                <span className="self-start border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 transition-colors group-hover:border-volt-500/50 group-hover:text-volt-500">
                  {cs.audience}
                </span>
                <div className="mt-8">
                  <span className="font-display text-4xl font-bold uppercase tracking-tightest text-volt-500 sm:text-5xl">
                    {cs.metric}
                  </span>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-neutral-300">
                    {cs.metricLabel}
                  </p>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-400">
                  {cs.summary}
                </p>
                <p className="mt-6 border-t border-white/10 pt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                  {cs.company}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-px grid gap-px border-x border-b border-white/10 bg-white/10 lg:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="relative h-full bg-carbon-900 p-8 sm:p-10">
                <Quote className="absolute right-8 top-8 h-10 w-10 text-carbon-700" />
                <blockquote className="relative max-w-xl text-pretty font-display text-xl font-medium leading-snug text-white sm:text-2xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center bg-volt-500 font-mono text-sm font-bold text-carbon-950">
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span>
                    <span className="block font-mono text-xs uppercase tracking-[0.15em] text-white">
                      {t.name}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                      {t.company}
                    </span>
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
