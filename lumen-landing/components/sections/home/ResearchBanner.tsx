"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { RESEARCH_BANNER } from "@/lib/home-content";

export function ResearchBanner() {
  return (
    <section className="bg-lumen-night py-12 sm:py-16 lg:py-20">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-lumen-purple-700 via-lumen-purple-800 to-lumen-purple-950 px-6 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-lumen-purple-400/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]"
          />
          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-tight">
              {RESEARCH_BANNER.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed">
              {RESEARCH_BANNER.body}
            </p>
            <div className="mt-8">
              <ButtonLink
                href={RESEARCH_BANNER.cta.href}
                size="md"
                className="uppercase tracking-[0.18em] bg-white text-lumen-purple-800 hover:bg-lumen-cream"
              >
                {RESEARCH_BANNER.cta.label}
              </ButtonLink>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
