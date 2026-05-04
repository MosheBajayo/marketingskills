"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MOLLY_TESTIMONIAL, HOME_ASSETS } from "@/lib/home-content";

export function MollyTestimonial() {
  return (
    <section className="bg-lumen-night py-12 sm:py-16 lg:py-20 text-white">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[16/9] sm:aspect-[16/7] w-full overflow-hidden rounded-3xl shadow-card-lg max-w-6xl mx-auto"
        >
          <Image
            src={HOME_ASSETS.mollyTestimonial}
            alt="Dr. Molly Maloof testimonial"
            fill
            sizes="(max-width: 1280px) 100vw, 1100px"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20"
          />

          <button
            type="button"
            aria-label="Play Molly Maloof testimonial"
            className="group absolute inset-0 flex items-center justify-center focus:outline-none"
          >
            <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="h-7 w-7 text-lumen-purple-700 fill-lumen-purple-700" />
            </span>
          </button>

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-12 max-w-xl">
            <blockquote className="font-display text-lg sm:text-xl lg:text-2xl font-semibold text-white leading-snug">
              <span className="block text-3xl sm:text-4xl text-white/40 leading-none mb-1">
                &ldquo;
              </span>
              {MOLLY_TESTIMONIAL.quote}
            </blockquote>
            <p className="mt-5 text-sm sm:text-base font-bold text-white">
              {MOLLY_TESTIMONIAL.name}
            </p>
            <p className="text-xs text-white/70">
              {MOLLY_TESTIMONIAL.title}
            </p>
          </div>

          <div
            className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5"
            aria-hidden="true"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
