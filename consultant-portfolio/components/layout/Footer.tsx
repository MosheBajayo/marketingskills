import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { nav, site } from "@/lib/content";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-carbon-950">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-lg font-bold uppercase tracking-tight text-white">
                {site.shortName}
              </span>
              <span className="font-display text-lg font-bold uppercase tracking-tight text-volt-500">
                Growth
              </span>
              <span className="h-1.5 w-1.5 self-center bg-volt-500" />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              A conversion &amp; experimentation studio for Tech, DTC, and
              B2B2C brands. {site.tagline}
            </p>
            <p className="mt-4 font-mono text-xs text-neutral-600">
              {site.location}
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              Navigate
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-neutral-400 transition-colors hover:text-volt-500"
                >
                  Home
                </Link>
              </li>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-volt-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              Connect
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-volt-500"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.socials.linkedin}
                  className="inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-volt-500"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a
                  href={site.socials.x}
                  className="inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-volt-500"
                  target="_blank"
                  rel="noreferrer"
                >
                  X / Twitter <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-neutral-600">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-600">
            Growth, engineered
          </p>
        </div>
      </Container>

      {/* Oversized outline wordmark */}
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden pb-2"
      >
        <p className="text-outline whitespace-nowrap text-center font-display text-[18vw] font-bold uppercase leading-[0.8] tracking-tightest">
          Bajayo Growth
        </p>
      </div>
    </footer>
  );
}
