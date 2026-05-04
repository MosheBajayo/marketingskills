"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Check } from "lucide-react";
import { GOLD_STANDARD, HOME_ASSETS } from "@/lib/home-content";

export function GoldStandard() {
  return (
    <section className="bg-lumen-night py-12 sm:py-16 lg:py-20 text-white">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-lumen-purple-600/20 ring-1 ring-lumen-purple-500/40 text-lumen-purple-300">
                <Check className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <h2 className="mt-4 font-display text-2xl sm:text-3xl lg:text-[34px] font-bold text-white leading-tight max-w-md">
                {GOLD_STANDARD.title}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed max-w-md">
                {GOLD_STANDARD.body}
              </p>
            </div>

            <div className="relative w-full max-w-[420px] mx-auto aspect-square">
              <Image
                src={HOME_ASSETS.goldStandard}
                alt="Lumen device"
                fill
                sizes="(max-width: 1024px) 80vw, 420px"
                className="object-contain"
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
