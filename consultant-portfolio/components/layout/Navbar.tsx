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
          ? "border-b border-white/10 bg-carbon-950/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            className="group flex items-baseline gap-1.5"
            aria-label={`${site.name} — home`}
          >
            <span className="font-display text-lg font-bold uppercase tracking-tight text-white">
              {site.shortName}
            </span>
            <span className="font-display text-lg font-bold uppercase tracking-tight text-volt-500">
              Growth
            </span>
            <span className="h-1.5 w-1.5 self-center bg-volt-500 transition-transform duration-300 group-hover:rotate-45" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-mono text-xs uppercase tracking-[0.2em] transition-colors",
                    active
                      ? "text-volt-500"
                      : "text-neutral-400 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Button href="/contact" size="sm">
              Book an audit
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center text-neutral-300 hover:text-white md:hidden"
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
          "md:hidden overflow-hidden border-t border-white/10 bg-carbon-950/95 backdrop-blur-xl transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <Container className="py-5">
          <div className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-2 py-3 font-mono text-sm uppercase tracking-[0.2em] transition-colors",
                    active ? "text-volt-500" : "text-neutral-300 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button href="/contact" className="mt-4 w-full">
              Book an audit
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
