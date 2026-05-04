"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PLANS } from "@/lib/constants";
import type { Plan } from "@/lib/types";

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative flex flex-col items-center rounded-2xl px-6 py-10 text-center text-white bg-[#0c0625] ring-1 ring-white/5"
    >
      {plan.saving ? (
        <span className="absolute top-3 right-3 rounded-md bg-lumen-cream px-2 py-0.5 text-[11px] font-semibold text-lumen-darker">
          {plan.saving}
        </span>
      ) : null}

      <h3 className="font-display text-2xl sm:text-[26px] font-extrabold leading-tight text-white whitespace-pre-line">
        {plan.name.replace("METABOLISM ", "METABOLISM\n")}
      </h3>
      <p className="mt-5 text-base font-normal text-white/85">
        {plan.duration}
      </p>

      <div className="mt-5 text-5xl sm:text-[56px] font-extrabold tracking-tight leading-none text-white">
        {plan.price}
      </div>

      <ButtonLink
        href={plan.link}
        size="md"
        variant="primary"
        className="mt-8 w-full uppercase tracking-[0.15em] rounded-full"
      >
        Start Now
      </ButtonLink>
    </motion.div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="bg-lumen-night py-10 sm:py-14 lg:py-16">
      <Container size="xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1a0d3a] px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-lumen-purple-500/15 blur-3xl"
          />
          <div className="relative">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Choose your track
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/80">
                Lumen device included, with warranty
                <br className="hidden sm:block" />
                for the duration of your track
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch max-w-5xl mx-auto">
              {PLANS.map((plan, i) => (
                <PlanCard key={plan.name} plan={plan} index={i} />
              ))}
            </div>

            <p className="mt-8 flex items-center justify-center gap-1.5 text-xs sm:text-[13px] text-white/70 max-w-2xl mx-auto leading-relaxed">
              To ensure you never miss a breath, tracks renew automatically and
              you can cancel anytime
              <Info className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
