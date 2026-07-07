import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { about, site } from "@/lib/content";

export function About() {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-tech-500/5 blur-[130px]" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Left: bio */}
          <div>
            <SectionHeading eyebrow={about.eyebrow} title={about.title} />
            <div className="mt-6 space-y-4">
              {about.paragraphs.map((p, i) => (
                <Reveal key={i} delay={0.05 + i * 0.05}>
                  <p className="text-pretty leading-relaxed text-slate-400">
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Tool groups */}
            <div className="mt-8 space-y-4">
              {about.toolGroups.map((group, i) => (
                <Reveal key={group.label} delay={0.1 + i * 0.05}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-44 shrink-0 font-mono text-xs uppercase tracking-widest text-slate-500">
                      {group.label}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {group.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-md border border-ink-700 bg-ink-850 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: highlight cards */}
          <div className="grid grid-cols-2 gap-4 self-start">
            {about.highlights.map((h, i) => (
              <Reveal key={h.label} delay={i * 0.08}>
                <div className="flex h-full flex-col justify-between rounded-3xl border border-ink-700/70 bg-ink-900/60 p-6 backdrop-blur transition-colors hover:border-signal-500/40">
                  <span className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    {h.value}
                  </span>
                  <span className="mt-3 text-sm leading-snug text-slate-400">
                    {h.label}
                  </span>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.32} className="col-span-2">
              <div className="rounded-3xl border border-signal-500/30 bg-signal-500/5 p-6 backdrop-blur">
                <p className="text-sm leading-relaxed text-slate-300">
                  Based in {site.location.split("·")[0].trim()} — working with
                  teams across global markets, in English and Hebrew.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
