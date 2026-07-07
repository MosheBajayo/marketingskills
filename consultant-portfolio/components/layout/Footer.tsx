import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { nav, site } from "@/lib/content";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="relative border-t border-ink-700/70 bg-ink-950">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-gradient font-mono text-sm font-bold text-ink-950">
                {site.wordmark}
              </span>
              <span className="text-sm font-semibold text-white">
                {site.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              {site.tagline}
            </p>
            <p className="mt-4 text-xs text-slate-600">{site.location}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Navigate
            </h3>
            <ul className="mt-4 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Connect
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.socials.linkedin}
                  className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a
                  href={site.socials.x}
                  className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  X / Twitter <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-700/70 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="font-mono text-xs text-slate-600">
            Built for growth · Measured by revenue
          </p>
        </div>
      </Container>
    </footer>
  );
}
