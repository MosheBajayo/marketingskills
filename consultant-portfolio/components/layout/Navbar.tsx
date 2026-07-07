"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { nav, site } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-ink-700/70 bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label={`${site.name} — home`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-gradient font-mono text-sm font-bold text-ink-950 shadow-glow-sm">
              {site.wordmark}
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-white">
                {site.name}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-500">
                {site.role}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    active
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Button href="/contact" size="sm">
              Book a Strategy Audit
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-white/5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </Container>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-ink-700/70 bg-ink-950/95 backdrop-blur-xl transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <Container className="py-4">
          <div className="flex flex-col gap-1">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-4 py-3 text-base transition-colors",
                    active
                      ? "bg-white/5 text-white"
                      : "text-slate-300 hover:bg-white/5",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button href="/contact" className="mt-3 w-full">
              Book a Strategy Audit
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
