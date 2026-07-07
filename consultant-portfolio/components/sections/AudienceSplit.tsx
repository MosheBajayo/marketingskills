"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Cpu, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { audiences } from "@/lib/content";
import { cn } from "@/lib/utils";

const icons = { tech: Cpu, ecom: ShoppingBag } as const;

export function AudienceSplit() {
  const [active, setActive] = useState<(typeof audiences)[number]["id"]>(
    audiences[0].id,
  );
  const current = audiences.find((a) => a.id === active) ?? audiences[0];
  const ActiveIcon = icons[current.id];

  return (
    <section id="split" className="relative py-24 sm:py-32">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="01 — Who we help"
            title="Two playbooks. One discipline."
            description="The methodology rhymes — research, prioritize, test — but the levers differ. Pick your world."
          />

          {/* Segmented toggle */}
          <div className="flex w-full max-w-md shrink-0 border border-white/15">
            {audiences.map((a) => {
              const Icon = icons[a.id];
              const isActive = a.id === active;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActive(a.id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-2 px-4 py-3.5 font-mono text-xs uppercase tracking-[0.15em] transition-colors",
                    isActive
                      ? "bg-volt-500 text-carbon-950"
                      : "text-neutral-400 hover:text-white",
                  )}
                  aria-pressed={isActive}
                >
                  <Icon className="h-4 w-4" />
                  {a.id === "tech" ? "Tech / SaaS" : "DTC / E-com"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated panel */}
        <div className="relative mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="grid gap-px border border-white/10 bg-white/10 lg:grid-cols-[1.4fr_1fr]"
            >
              {/* Left: narrative */}
              <div className="relative overflow-hidden bg-carbon-900 p-8 sm:p-12">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-volt-500/10 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center border border-volt-500/40 text-volt-500">
                      <ActiveIcon className="h-5 w-5" />
                    </span>
                    <p className="font-mono text-xs uppercase tracking-[0.25em] text-volt-500">
                      {current.kicker}
                    </p>
                  </div>

                  <h3 className="mt-7 font-display text-3xl font-bold uppercase leading-none tracking-tightest text-white sm:text-4xl">
                    {current.title}
                  </h3>
                  <p className="mt-5 max-w-lg text-pretty leading-relaxed text-neutral-400">
                    {current.description}
                  </p>

                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {current.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-sm text-neutral-300"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt-500" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/contact"
                    className="mt-9 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-volt-500 transition-opacity hover:opacity-80"
                  >
                    {current.cta}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Right: metrics stack */}
              <div className="grid grid-rows-3 gap-px bg-white/10">
                {current.metrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                    className="flex flex-col justify-center bg-carbon-900 px-8 py-6"
                  >
                    <span className="font-display text-5xl font-bold tracking-tightest text-volt-500 sm:text-6xl">
                      {m.value}
                    </span>
                    <span className="mt-1.5 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                      {m.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-600">
          Representative outcomes from engagements of this type.
        </p>
      </Container>
    </section>
  );
}
