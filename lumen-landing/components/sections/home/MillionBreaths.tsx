"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MILLION_BREATHS } from "@/lib/home-content";

const PEOPLE_COUNT = 24;

export function MillionBreaths() {
  return (
    <section className="bg-lumen-night py-14 sm:py-20 lg:py-24 text-white overflow-hidden">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto w-full max-w-3xl"
        >
          <div className="relative aspect-[2/1.1] rounded-t-full overflow-hidden ring-1 ring-white/10 bg-gradient-to-b from-lumen-surface to-lumen-night">
            {/* Mosaic of faces (CSS-only avatar grid for now) */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-3 gap-1 p-2 opacity-60">
              {Array.from({ length: PEOPLE_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-md bg-gradient-to-br from-lumen-purple-700/40 to-lumen-purple-900/60"
                  aria-hidden="true"
                />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-lumen-night/60 via-lumen-night/30 to-lumen-night"
            />

            {/* Centered count */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 text-center">
              <p className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight">
                {MILLION_BREATHS.number}
              </p>
              <p className="mt-2 text-sm sm:text-base text-white/80">
                {MILLION_BREATHS.body}
              </p>
            </div>

            <button
              type="button"
              aria-label="Play breaths around the world video"
              className="group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] focus:outline-none"
            >
              <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-lumen-purple-700 fill-lumen-purple-700" />
              </span>
            </button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
