"use client";

import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LumenLogo } from "@/components/ui/LumenLogo";
import { FOOTER } from "@/lib/constants";

const SOCIAL = [
  { Icon: Instagram, label: "Instagram", href: "#" },
  { Icon: Facebook, label: "Facebook", href: "#" },
  { Icon: Twitter, label: "Twitter", href: "#" },
  { Icon: Youtube, label: "YouTube", href: "#" },
  { Icon: Linkedin, label: "LinkedIn", href: "#" },
];

const PAYMENTS = ["VISA", "MC", "AMEX", "PP", "GP", "AP"];

export function Footer() {
  return (
    <footer className="bg-lumen-darker text-white">
      <Container size="xl" className="pt-16 lg:pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {FOOTER.columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase text-white/90">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-6 lg:pl-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              Subscribe to our mailing list
            </p>
            <form
              className="mt-4 flex flex-col sm:flex-row gap-3 max-w-md"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="Email"
                className="flex-1 h-11 rounded-full bg-white px-4 text-sm text-lumen-dark placeholder:text-lumen-gray focus:outline-none focus:ring-2 focus:ring-lumen-purple-400"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="sm:px-8 uppercase tracking-wider"
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <LumenLogo variant="white" />
            <span className="text-xs text-white/50">
              Copyright {new Date().getFullYear()} Metaflow Inc. All rights
              reserved.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ul className="flex items-center gap-2">
              {PAYMENTS.map((p) => (
                <li
                  key={p}
                  className="flex h-6 w-9 items-center justify-center rounded-sm bg-white text-[9px] font-bold tracking-wide text-lumen-dark"
                  aria-label={p}
                >
                  {p}
                </li>
              ))}
            </ul>

            <ul className="flex items-center gap-2">
              {SOCIAL.map(({ Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-white/15 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
