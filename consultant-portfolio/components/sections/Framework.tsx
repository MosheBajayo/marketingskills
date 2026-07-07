import { Search, ListChecks, PenTool, FlaskConical } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { framework } from "@/lib/content";

const icons = [Search, ListChecks, PenTool, FlaskConical];

export function Framework() {
  return (
    <section className="relative border-t border-ink-700/70 bg-ink-900/30 py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
      <Container className="relative">
        <SectionHeading
          eyebrow="The framework"
          title="A repeatable system for compounding wins"
          description="No magic, no guesswork. Every engagement runs on the same disciplined loop — the same loop that has shipped 600+ experiments."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {framework.map((phase, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={phase.step} delay={i * 0.08}>
                <div className="group relative flex h-full flex-col rounded-3xl border border-ink-700/70 bg-ink-900/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-signal-500/40 hover:shadow-glow-sm">
                  {/* Connector line (desktop) */}
                  {i < framework.length - 1 && (
                    <div className="pointer-events-none absolute -right-3 top-11 hidden h-px w-6 bg-gradient-to-r from-signal-500/60 to-transparent lg:block" />
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-600 bg-ink-800 text-signal-400 transition-colors group-hover:bg-signal-500/10">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-3xl font-semibold text-ink-600 transition-colors group-hover:text-signal-500/40">
                      {phase.step}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {phase.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-400">
                    {phase.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {phase.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-ink-700 bg-ink-850 px-2 py-1 font-mono text-[11px] text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
