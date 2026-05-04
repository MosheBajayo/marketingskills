"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { CheckBullet } from "@/components/ui/CheckBullet";
import { ASSETS, HERO_FEATURES } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-lumen-night pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32">
      {/* Soft background blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-40 h-[480px] w-[480px] rounded-full bg-lumen-purple-600/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 -right-32 h-[380px] w-[380px] rounded-full bg-lumen-purple-500/20 blur-3xl"
      />

      <Container size="xl" className="relative">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display text-balance text-center text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white max-w-4xl mx-auto"
        >
          Everything you need to optimize your health in the palm of your hand
        </motion.h1>

        <div className="mt-12 lg:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - feature list */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="font-display text-2xl sm:text-[28px] font-bold text-white">
              The Lumen Device
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Metabolic tracking in the palm of your hands
            </p>
            <ul className="mt-8 space-y-4 text-white/85">
              {HERO_FEATURES.map((feat) => (
                <CheckBullet key={feat} variant="dark">{feat}</CheckBullet>
              ))}
            </ul>
          </motion.div>

          {/* Right column - product image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto w-full max-w-[460px]"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={ASSETS.hero.desktop}
                alt="Lumen device with companion mobile app"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 460px"
                className="object-contain"
              />
              {/* Device included badge */}
              <div className="absolute top-[38%] left-[40%] sm:top-[34%] sm:left-[38%]">
                <div className="flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full bg-lumen-purple-600 text-center text-white text-[11px] font-extrabold uppercase tracking-[0.12em] leading-tight shadow-purple-glow ring-2 ring-white/20">
                  <span>Device</span>
                  <span>Included</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
