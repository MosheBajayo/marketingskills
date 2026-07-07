"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Cpu, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { audiences } from "@/lib/content";
import { cn } from "@/lib/utils";

// Static class maps so Tailwind can see every accent utility at build time.
const accentStyles = {
  tech: {
    text: "text-tech-400",
    ring: "ring-tech-500/40",
    chipActive: "bg-tech-500/15 text-tech-300 border-tech-500/40",
    metricBg: "bg-tech-500/10 border-tech-500/20",
    metricText: "text-tech-300",
    glow: "bg-tech-500/15",
    icon: Cpu,
  },
  commerce: {
    text: "text-commerce-400",
    ring: "ring-commerce-500/40",
    chipActive: "bg-commerce-500/15 text-commerce-300 border-commerce-500/40",
    metricBg: "bg-commerce-500/10 border-commerce-500/20",
    metricText: "text-commerce-300",
    glow: "bg-commerce-500/15",
    icon: ShoppingBag,
  },
} as const;

export function AudienceSplit() {
  const [active, setActive] = useState<(typeof audiences)[number]["id"]>(
    audiences[0].id,
  );
  const current = audiences.find((a) => a.id === active) ?? audiences[0];
  const styles = accentStyles[current.accent];
  const ActiveIcon = styles.icon;

  return (
    <section id="split" className="relative py-24 sm:py-28">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Two playbooks, one discipline"
          title="Pick your growth challenge"
          description="The methodology rhymes — research, prioritize, test — but the levers are different. Choose your world to see how I move the number that matters."
        />

        {/* Segmented toggle */}
        <div className="mx-auto mt-10 flex max-w-md items-center rounded-full border border-ink-700/70 bg-ink-900/60 p-1.5 backdrop-blur">
          {audiences.map((a) => {
            const s = accentStyles[a.accent];
            const Icon = s.icon;
            const isActive = a.id === active;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setActive(a.id)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-white" : "text-slate-400 hover:text-white",
                )}
                aria-pressed={isActive}
              >
                {isActive && (
                  <motion.span
                    layoutId="audience-pill"
                    className="absolute inset-0 rounded-full bg-ink-700/80 ring-1 ring-inset ring-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", isActive && s.text)} />
                  {a.id === "tech" ? "Tech / SaaS" : "D2C / E-com"}
                </span>
              </button>
            );
          })}
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
              className="grid gap-8 lg:grid-cols-2"
            >
              {/* Left: narrative */}
              <div className="relative overflow-hidden rounded-3xl border border-ink-700/70 bg-ink-900/60 p-8 backdrop-blur sm:p-10">
                <div
                  className={cn(
                    "pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl",
                    styles.glow,
                  )}
                />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl border border-ink-600 bg-ink-800",
                        styles.text,
                      )}
                    >
                      <ActiveIcon className="h-5 w-5" />
                    </span>
                    <p
                      className={cn(
                        "font-mono text-xs uppercase tracking-[0.2em]",
                        styles.text,
                      )}
                    >
                      {current.kicker}
                    </p>
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {current.title}
                  </h3>
                  <p className="mt-4 text-pretty leading-relaxed text-slate-400">
                    {current.description}
                  </p>

                  <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                    {current.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-sm text-slate-300"
                      >
                        <Check
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            styles.text,
                          )}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/contact"
                    className={cn(
                      "mt-8 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80",
                      styles.text,
                    )}
                  >
                    {current.cta}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Right: metrics */}
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {current.metrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                    className={cn(
                      "flex flex-col justify-center rounded-3xl border p-7 backdrop-blur",
                      styles.metricBg,
                    )}
                  >
                    <span
                      className={cn(
                        "text-4xl font-semibold tracking-tight sm:text-5xl",
                        styles.metricText,
                      )}
                    >
                      {m.value}
                    </span>
                    <span className="mt-2 text-sm text-slate-400">
                      {m.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
