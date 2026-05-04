"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DAVE_TESTIMONIAL } from "@/lib/constants";

export function DaveTestimonial() {
  const t = DAVE_TESTIMONIAL;
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#3a2a22] text-white">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-5">
            <button
              type="button"
              aria-label={`Play ${t.name}'s video testimonial`}
              className="group relative block w-full aspect-video rounded-3xl overflow-hidden shadow-card-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-lumen-purple-400"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#5a3e30] via-[#3a2a22] to-[#1f1612]"
                aria-hidden="true"
              />
              <span className="absolute inset-0 grid place-items-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Play
                    className="h-7 w-7 text-lumen-purple-700 fill-lumen-purple-700"
                    aria-hidden="true"
                  />
                </span>
              </span>
            </button>
          </div>

          <div className="lg:col-span-7">
            <blockquote className="font-display text-xl sm:text-2xl lg:text-3xl font-medium text-white leading-snug">
              <span className="block text-5xl sm:text-6xl text-white/40 leading-none mb-2">
                &ldquo;
              </span>
              {t.quote}
            </blockquote>
            <p className="mt-6 text-base font-bold text-white">{t.name}</p>
            <p className="text-sm text-white/70">{t.title}</p>
          </div>
        </motion.div>

        <div
          className="mt-10 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Testimonial slides"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-white"
          />
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-white/30"
          />
        </div>
      </Container>
    </section>
  );
}
