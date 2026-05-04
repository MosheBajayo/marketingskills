"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/types";

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(
        "relative flex flex-col items-center rounded-3xl p-8 text-center text-white",
        plan.highlighted
          ? "bg-lumen-purple-950/70 ring-2 ring-lumen-purple-400/80 shadow-purple-glow lg:scale-[1.05]"
          : "bg-white/5 ring-1 ring-white/10 shadow-card",
      )}
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-lumen-purple-300">
        {plan.name}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        {plan.duration}
      </h3>

      <div className="mt-6 text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
        {plan.price}
      </div>

      <ButtonLink
        href={plan.link}
        size="md"
        variant="primary"
        className="mt-8 w-full"
      >
        START NOW
      </ButtonLink>
    </motion.div>
  );
}

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28 bg-gradient-to-b from-lumen-purple-700 via-lumen-purple-800 to-lumen-purple-900"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-lumen-purple-500/30 blur-3xl"
      />
      <Container size="xl" className="relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Choose your track
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/80">
            Lumen device included, with warranty for the duration of your track
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-center">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        <p className="mt-10 text-center text-xs sm:text-sm text-white/70 max-w-2xl mx-auto leading-relaxed">
          To ensure you never miss a breath, tracks renew automatically and you
          can cancel anytime.
        </p>

        <p className="mt-6 text-center text-sm font-semibold text-white">
          Try Lumen risk-free for 30 days
        </p>
      </Container>
    </section>
  );
}
