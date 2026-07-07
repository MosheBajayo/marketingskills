import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/sections/CTA";
import { studio, founder, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bajayo Growth is a conversion & experimentation studio founded by Moshe Bajayo — built on 7+ years scaling growth for PepsiCo, SodaStream, Terminal X, Office Depot, and Lumen.",
};

export default function AboutPage() {
  return (
    <>
      {/* Studio hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-volt-500/10 blur-[150px]" />
        <Container className="relative py-20 sm:py-28">
          <Reveal>
            <Badge>{studio.eyebrow}</Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-8 max-w-4xl font-display text-5xl font-bold uppercase leading-[0.9] tracking-tightest text-white sm:text-7xl">
              {studio.title}
            </h1>
          </Reveal>
          <div className="mt-10 grid max-w-4xl gap-6">
            {studio.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.1 + i * 0.05}>
                <p className="text-pretty text-lg leading-relaxed text-neutral-400">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Principles */}
      <section className="border-b border-white/10 bg-carbon-900/40 py-24 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Operating principles"
            title="How we think"
          />
          <div className="mt-14 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            {studio.principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="group h-full bg-carbon-950 p-8 transition-colors duration-300 hover:bg-carbon-900 sm:p-10">
                  <span className="font-display text-5xl font-bold tracking-tightest text-carbon-700 transition-colors duration-300 group-hover:text-volt-500">
                    0{i + 1}
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold uppercase tracking-tight text-white">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
                    {p.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Founder */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            {/* Left: identity card */}
            <div>
              <SectionHeading eyebrow="The founder" title={founder.name} />
              <Reveal delay={0.1}>
                <p className="mt-3 font-mono text-sm uppercase tracking-[0.2em] text-volt-500">
                  {founder.role}
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-10 flex aspect-square max-w-sm items-center justify-center border border-white/10 bg-carbon-900">
                  {/* Swap for a real portrait: /public/founder.jpg + next/image */}
                  <span className="font-display text-8xl font-bold uppercase tracking-tightest text-volt-500">
                    {founder.initials}
                  </span>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <a
                  href={site.socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-volt-500"
                >
                  LinkedIn
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Reveal>
            </div>

            {/* Right: bio + track record */}
            <div>
              <div className="grid gap-5">
                {founder.bio.map((p, i) => (
                  <Reveal key={i} delay={0.05 + i * 0.05}>
                    <p className="text-pretty leading-relaxed text-neutral-400 sm:text-lg">
                      {p}
                    </p>
                  </Reveal>
                ))}
              </div>

              {/* Experience timeline */}
              <div className="mt-12 border-t border-white/10">
                {founder.experience.map((exp, i) => (
                  <Reveal key={exp.company} delay={i * 0.05}>
                    <div className="group grid gap-2 border-b border-white/10 py-6 transition-colors duration-300 hover:bg-carbon-900 sm:grid-cols-[110px_1fr] sm:gap-8 sm:px-4">
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-volt-500">
                        {exp.period}
                      </span>
                      <div>
                        <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white">
                          {exp.company}
                        </h3>
                        <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-neutral-400">
                          {exp.role}
                        </p>
                        <p className="mt-2 text-sm text-neutral-500">
                          {exp.note}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Toolbox */}
              <div className="mt-12 space-y-5">
                {founder.toolGroups.map((group, i) => (
                  <Reveal key={group.label} delay={0.1 + i * 0.05}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                      <span className="w-52 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        {group.label}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {group.tools.map((tool) => (
                          <span
                            key={tool}
                            className="border border-white/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-neutral-300"
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
          </div>
        </Container>
      </section>

      <CTA
        title="Work directly with the founder"
        description="Every engagement is led personally — from the first research readout to the last shipped experiment. Book a call and see if we're a fit."
      />
    </>
  );
}
