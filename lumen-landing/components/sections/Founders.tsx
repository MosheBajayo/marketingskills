"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ASSETS, FOUNDERS } from "@/lib/constants";

export function Founders() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-lumen-night text-white">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-purple-glow ring-1 ring-lumen-purple-500/40">
              <Image
                src={ASSETS.founders.desktop}
                alt="Drs. Michal & Merav Mor — Founders of Lumen"
                fill
                sizes="(max-width: 1024px) 90vw, 480px"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-sm font-semibold text-white/90 text-center">
              {FOUNDERS.attribution}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[520px] rounded-full bg-gradient-to-br from-lumen-surface via-[#150a30] to-lumen-darker ring-1 ring-white/10 shadow-purple-glow flex items-center justify-center p-10 sm:p-14 lg:p-16">
              <div className="text-center">
                <span className="block text-5xl sm:text-6xl text-lumen-purple-300 leading-none mb-3">
                  &ldquo;
                </span>
                <blockquote className="font-display text-base sm:text-lg lg:text-xl font-medium text-white leading-relaxed">
                  {FOUNDERS.quote}
                </blockquote>
                <p className="mt-5 text-sm sm:text-base italic text-lumen-purple-300">
                  {FOUNDERS.tagline}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
