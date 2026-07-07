import { ArrowUpRight, Calendar } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CTA({
  title = "Let's find the revenue you're leaving on the table",
  description = "Book a strategy audit and I'll show you the three highest-leverage experiments I'd run on your funnel — before you commit to anything.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="pb-28 pt-4">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl border border-ink-700/70 bg-ink-900/70 px-6 py-16 text-center backdrop-blur sm:px-16 sm:py-20">
            {/* Glow accents */}
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-signal-500/20 blur-[120px]" />

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-signal-500/30 bg-signal-500/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-signal-300">
                <Calendar className="h-3.5 w-3.5" />
                Free 30-minute call
              </span>
              <h2 className="mt-6 text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                {title}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-slate-400">
                {description}
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button href="/contact" size="lg">
                  Book a Strategy Audit
                  <ArrowUpRight className="h-5 w-5" />
                </Button>
                <Button href="/services" size="lg" variant="ghost">
                  Compare packages
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
