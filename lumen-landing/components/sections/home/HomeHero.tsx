"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { HOME_ASSETS, HOME_HERO } from "@/lib/home-content";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-lumen-night text-white pt-10 pb-12 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
      <Container size="xl" className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.05] text-white">
              The first device to hack
              <br className="hidden sm:block" /> your metabolism
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/75 max-w-md mx-auto lg:mx-0">
              {HOME_HERO.body}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <ButtonLink
                href={HOME_HERO.primaryCta.href}
                variant="primary"
                size="md"
                className="uppercase tracking-[0.15em]"
              >
                {HOME_HERO.primaryCta.label}
              </ButtonLink>
              <ButtonLink
                href={HOME_HERO.secondaryCta.href}
                size="md"
                className="uppercase tracking-[0.15em] bg-white/[0.04] text-white ring-1 ring-white/15 hover:bg-white/[0.08]"
              >
                {HOME_HERO.secondaryCta.label}
              </ButtonLink>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative w-full max-w-[480px] mx-auto order-1 lg:order-2"
          >
            <div className="relative aspect-square">
              <Image
                src={HOME_ASSETS.device.hero}
                alt="Lumen metabolism tracking device"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 480px"
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
