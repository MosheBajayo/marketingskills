import { Container } from "@/components/ui/Container";
import { clients } from "@/lib/content";

export function Clients() {
  const row = [...clients, ...clients];
  return (
    <section className="border-y border-ink-700/70 bg-ink-900/40 py-10">
      <Container>
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
          Trusted by growth teams at
        </p>
      </Container>
      <div className="group relative mt-6 overflow-hidden">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent" />
        <div className="flex w-max animate-marquee items-center gap-14 group-hover:[animation-play-state:paused]">
          {row.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap text-lg font-semibold tracking-tight text-slate-500 transition-colors hover:text-slate-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
