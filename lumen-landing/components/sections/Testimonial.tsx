"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ASSETS, VIDEO_TESTIMONIAL } from "@/lib/constants";

export function Testimonial() {
  const t = VIDEO_TESTIMONIAL;
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-lumen-night text-white">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-7 order-2 lg:order-1">
            <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-snug">
              <span className="block text-6xl sm:text-7xl text-lumen-purple-300 leading-none mb-2">
                &ldquo;
              </span>
              {t.quote}
            </blockquote>
            <p className="mt-6 text-base sm:text-lg text-white/70">
              <span className="font-bold text-white">{t.name}</span> lost 15 lbs and broke
              through her plateau
            </p>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2">
            <button
              type="button"
              aria-label={`Play ${t.name}'s video testimonial`}
              className="group relative block w-full aspect-square rounded-4xl overflow-hidden shadow-card-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-lumen-purple-400"
            >
              <Image
                src={ASSETS.reviews.bernadette}
                alt={t.imageAlt}
                fill
                sizes="(max-width: 1024px) 90vw, 460px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                aria-hidden="true"
              />
              <span className="absolute inset-0 grid place-items-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Play
                    className="h-7 w-7 text-lumen-purple-700 fill-lumen-purple-700"
                    aria-hidden="true"
                  />
                </span>
              </span>
            </button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
