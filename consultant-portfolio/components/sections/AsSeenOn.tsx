import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { brands } from "@/lib/content";

/**
 * "As seen on" logo wall. Renders brand wordmarks in a uniform grayscale
 * grid that reveals color on hover. To use real logo artwork, drop SVGs
 * in /public/logos and swap the <span> wordmark for an <Image>.
 */
export function AsSeenOn() {
  return (
    <section className="relative border-y border-ink-700/70 bg-ink-900/40 py-16">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
      <Container className="relative">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-signal-400">
            As seen on
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-balance text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Trusted by the brands behind the growth
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-700/40 sm:grid-cols-3">
            {brands.map((brand) => (
              <li
                key={brand.name}
                className="group flex flex-col items-center justify-center gap-1 bg-ink-950 px-6 py-8 transition-colors hover:bg-ink-900"
              >
                <span className="text-xl font-semibold tracking-tight text-slate-500 transition-colors group-hover:text-white sm:text-2xl">
                  {brand.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-700 transition-colors group-hover:text-signal-400">
                  {brand.note}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 text-center text-xs text-slate-600">
            Roles held across 7+ years in growth &amp; CRO. Logos represent
            employers and brands worked with.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
