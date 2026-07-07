import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function CTA({
  title = "Let's find the revenue you're leaving on the table",
  description = "Book a strategy audit and we'll show you the three highest-leverage experiments we'd run on your funnel — before you commit to anything.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="bg-volt-500 text-carbon-950">
      <Container className="py-20 sm:py-28">
        <Reveal>
          <p className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.3em]">
            <span className="inline-block h-px w-8 bg-carbon-950" aria-hidden />
            Free 30-minute call
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 max-w-4xl font-display text-5xl font-bold uppercase leading-[0.9] tracking-tightest sm:text-7xl">
            {title}
          </h2>
        </Reveal>
        <div className="mt-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <Reveal delay={0.1}>
            <p className="max-w-xl text-pretty text-lg font-medium leading-relaxed text-carbon-950/80">
              {description}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <a
              href="/contact"
              className="group inline-flex h-14 shrink-0 items-center gap-2 bg-carbon-950 px-8 font-display text-sm font-semibold uppercase tracking-wide text-volt-500 transition-all duration-200 hover:bg-white hover:text-carbon-950 hover:-translate-y-0.5"
            >
              Book a strategy audit
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
