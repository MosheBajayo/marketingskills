"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EXPERTS, HOME_ASSETS } from "@/lib/home-content";

const PHOTOS = [
  HOME_ASSETS.experts.markHyman,
  HOME_ASSETS.experts.mollyMaloof,
  HOME_ASSETS.experts.jasonFung,
];

export function ExpertsSection() {
  return (
    <section className="bg-lumen-night py-14 sm:py-20 lg:py-24 text-white">
      <Container size="xl">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-bold text-center text-white">
          Hear from the experts
        </h2>

        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {EXPERTS.map((e, i) => (
            <motion.div
              key={e.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <button
                type="button"
                aria-label={`Play ${e.name} video`}
                className="group relative block w-full aspect-square overflow-hidden rounded-2xl shadow-card focus:outline-none focus-visible:ring-4 focus-visible:ring-lumen-purple-400"
              >
                <Image
                  src={PHOTOS[i]}
                  alt={`${e.name} portrait`}
                  fill
                  sizes="(max-width: 640px) 90vw, 320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/40"
                  aria-hidden="true"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play
                      className="h-5 w-5 text-lumen-purple-700 fill-lumen-purple-700"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </button>
              <p className="mt-4 text-base font-bold text-white">{e.name}</p>
              <p className="text-xs text-white/60 leading-relaxed">{e.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-lumen-purple-200 transition-colors"
          >
            See More
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Container>
    </section>
  );
}
