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
            className="lg:col-span-6"
          >
            <div className="relative aspect-[4/3] rounded-4xl overflow-hidden shadow-purple-glow ring-1 ring-lumen-purple-500/40">
              <Image
                src={ASSETS.founders.desktop}
                alt="Drs. Michal & Merav Mor — Founders of Lumen"
                fill
                sizes="(max-width: 1024px) 90vw, 600px"
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
            className="lg:col-span-6"
          >
            <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-snug">
              <span className="text-5xl sm:text-6xl text-lumen-purple-300 leading-none align-top mr-1">
                &ldquo;
              </span>
              {FOUNDERS.quote}
            </blockquote>
            <p className="mt-6 text-lg italic text-lumen-purple-300">
              {FOUNDERS.tagline}
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
