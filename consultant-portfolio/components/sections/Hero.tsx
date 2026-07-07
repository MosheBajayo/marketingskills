import { ArrowUpRight, TrendingUp, LineChart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { heroStats, site } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-grid-fade" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-signal-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-tech-500/10 blur-[120px]" />

      <Container className="relative pb-20 pt-16 sm:pt-24 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="flex justify-center">
              <Badge>Booking Q3 · 1 spot remaining</Badge>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Turn expensive traffic into{" "}
              <span className="gradient-text">predictable revenue</span>.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400 sm:text-xl">
              I&apos;m {site.name}, a Growth &amp; CRO consultant for{" "}
              <strong className="font-semibold text-slate-200">
                Tech &amp; SaaS
              </strong>{" "}
              and{" "}
              <strong className="font-semibold text-slate-200">
                D2C e-commerce
              </strong>{" "}
              brands. I find where revenue leaks, then run rigorous experiments
              that close the gap — measured in dollars, not opinions.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/contact" size="lg">
                Book a Strategy Audit
                <ArrowUpRight className="h-5 w-5" />
              </Button>
              <Button href="/services" size="lg" variant="secondary">
                Explore services
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-400" />
              No retainers before we agree on the number that matters.
            </p>
          </Reveal>
        </div>

        {/* Stats bar */}
        <Reveal delay={0.25}>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 divide-y divide-ink-700/70 overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900/60 backdrop-blur sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {heroStats.map((stat, i) => (
              <div key={stat.label} className="px-6 py-7 text-center">
                <div className="flex items-center justify-center gap-2">
                  {i === 0 && (
                    <TrendingUp className="h-5 w-5 text-signal-400" />
                  )}
                  {i === 1 && <LineChart className="h-5 w-5 text-tech-400" />}
                  {i === 2 && (
                    <TrendingUp className="h-5 w-5 text-commerce-400" />
                  )}
                  <span className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
