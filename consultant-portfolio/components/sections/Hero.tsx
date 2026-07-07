import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { heroStats } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient: single volt glow, faint dots */}
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-volt-500/10 blur-[160px]" />

      <Container className="relative pb-16 pt-14 sm:pt-20 lg:pt-24">
        <Reveal>
          <Badge>Growth &amp; CRO Studio — Tech · DTC · B2B2C</Badge>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-8 font-display text-6xl font-bold uppercase leading-[0.88] tracking-tightest text-white sm:text-8xl lg:text-[9.5rem]">
            Growth,
            <br />
            <span className="text-volt-500">engineered</span>
            <span className="text-white">.</span>
          </h1>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Reveal delay={0.1}>
            <p className="max-w-xl text-pretty text-lg leading-relaxed text-neutral-400 sm:text-xl">
              We turn expensive traffic into{" "}
              <strong className="font-semibold text-white">
                predictable revenue
              </strong>{" "}
              for Tech, DTC, and B2B2C brands — with the experimentation
              discipline we ran inside{" "}
              <strong className="font-semibold text-white">PepsiCo</strong>,{" "}
              <strong className="font-semibold text-white">SodaStream</strong>,{" "}
              <strong className="font-semibold text-white">Terminal X</strong>{" "}
              and{" "}
              <strong className="font-semibold text-white">
                Office Depot
              </strong>
              . Measured in dollars, not opinions.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-col items-start gap-3 sm:flex-row lg:justify-end">
              <Button href="/contact" size="lg">
                Book a strategy audit
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button href="/services" size="lg" variant="secondary">
                Services
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Stats strip */}
        <Reveal delay={0.2}>
          <div className="mt-16 grid grid-cols-1 border-t border-white/10 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="border-b border-white/10 py-6 pr-8 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:[&:nth-child(2)]:pl-8 sm:last:pl-8"
              >
                <span className="font-display text-4xl font-bold uppercase tracking-tightest text-volt-500 sm:text-5xl">
                  {stat.value}
                </span>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
