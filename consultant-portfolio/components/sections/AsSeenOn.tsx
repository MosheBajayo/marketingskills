import { Container } from "@/components/ui/Container";
import { brands } from "@/lib/content";

/**
 * "As seen on" brand band. Oversized wordmark marquee — the boldest proof
 * on the page. To use real logo artwork, drop SVGs in /public/logos and
 * swap the <span> wordmarks for <Image> elements.
 */
export function AsSeenOn() {
  const row = [...brands, ...brands];
  return (
    <section className="border-y border-white/10 bg-carbon-900/60 py-12">
      <Container>
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
          <span className="inline-block h-px w-8 bg-volt-500" aria-hidden />
          As seen on — brands our work has shipped for
        </p>
      </Container>

      <div className="group relative mt-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-carbon-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-carbon-950 to-transparent" />
        <div className="flex w-max animate-marquee-slow items-center group-hover:[animation-play-state:paused]">
          {row.map((brand, i) => (
            <span
              key={`${brand.name}-${i}`}
              className="flex items-baseline gap-4 pr-16"
            >
              <span className="whitespace-nowrap font-display text-5xl font-bold uppercase tracking-tightest text-neutral-600 transition-colors duration-300 hover:text-white sm:text-6xl">
                {brand.name}
              </span>
              <span className="hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-700 sm:inline">
                {brand.note}
              </span>
              <span className="h-2 w-2 bg-volt-500" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      <Container>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-600">
          Roles held across 7+ years in growth &amp; CRO — employers and
          brands worked with.
        </p>
      </Container>
    </section>
  );
}
