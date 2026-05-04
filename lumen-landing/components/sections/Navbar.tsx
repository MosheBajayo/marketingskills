"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LumenLogo } from "@/components/ui/LumenLogo";
import { NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40 w-full">
      {/* Main nav */}
      <div className="bg-lumen-night border-b border-white/10">
        <Container size="xl">
          <nav className="flex h-16 items-center justify-between" aria-label="Main">
            <a href="/" className="flex items-center" aria-label="Lumen home">
              <LumenLogo variant="white" />
            </a>

            <ul className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <ButtonLink
                href="#pricing"
                variant="primary"
                size="sm"
                className="hidden lg:inline-flex"
              >
                Select Track
              </ButtonLink>
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-white"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </nav>
        </Container>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden bg-lumen-night border-t border-white/10"
            >
              <Container size="xl" className="py-4">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="block py-3 text-base font-medium text-white hover:text-lumen-purple-300"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                  <li className="pt-2">
                    <ButtonLink
                      href="#pricing"
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={() => setOpen(false)}
                    >
                      Select Track
                    </ButtonLink>
                  </li>
                </ul>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
