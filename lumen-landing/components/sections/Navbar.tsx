"use client";

import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LumenLogo } from "@/components/ui/LumenLogo";

export function Navbar() {
  return (
    <header className="relative z-40 w-full bg-lumen-night border-b border-lumen-mint/40">
      <Container size="xl">
        <nav
          className="flex h-11 items-center justify-between gap-4"
          aria-label="Main"
        >
          <a
            href="/"
            className="flex items-center shrink-0"
            aria-label="Lumen home"
          >
            <LumenLogo variant="white" />
          </a>

          <p className="hidden md:block text-center text-[13px] sm:text-sm tracking-wide text-white">
            <span className="font-extrabold uppercase tracking-[0.18em] text-lumen-mint">
              Limited offer
            </span>
            <span className="mx-2 font-semibold uppercase">
              Get an extra month free
            </span>
            <span className="mx-2 text-white/40">|</span>
            <span className="font-semibold uppercase">
              Use code: <span className="font-extrabold">1M4F</span>
            </span>
          </p>

          <ButtonLink
            href="#pricing"
            variant="primary"
            size="sm"
            className="shrink-0"
          >
            Select Track
          </ButtonLink>
        </nav>

        <p className="md:hidden pb-3 text-center text-xs tracking-wide text-white">
          <span className="font-extrabold uppercase tracking-[0.18em] text-lumen-mint">
            Limited offer
          </span>
          <span className="mx-2 font-semibold uppercase">
            Extra month free
          </span>
          <span className="mx-1 text-white/40">|</span>
          <span className="font-semibold uppercase">
            Code: <span className="font-extrabold">1M4F</span>
          </span>
        </p>
      </Container>
    </header>
  );
}
