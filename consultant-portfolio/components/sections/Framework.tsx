import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { framework } from "@/lib/content";

export function Framework() {
  return (
    <section className="relative border-t border-white/10 bg-carbon-900/40 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="02 — How we work"
          title="A repeatable system for compounding wins"
          description="No magic, no guesswork. Every engagement runs on the same disciplined loop we've run inside global brands."
        />

        <div className="mt-16 border-t border-white/10">
          {framework.map((phase, i) => (
            <Reveal key={phase.step} delay={i * 0.06}>
              <div className="group grid gap-6 border-b border-white/10 py-10 transition-colors duration-300 hover:bg-carbon-900 md:grid-cols-[120px_1fr_260px] md:items-start md:gap-10 md:px-6">
                <span className="font-display text-6xl font-bold leading-none tracking-tightest text-carbon-700 transition-colors duration-300 group-hover:text-volt-500 sm:text-7xl">
                  {phase.step}
                </span>

                <div>
                  <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                    {phase.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
                    {phase.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {phase.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-white/15 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-500 transition-colors group-hover:border-volt-500/40 group-hover:text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
