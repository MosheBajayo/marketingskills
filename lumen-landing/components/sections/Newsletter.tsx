"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ASSETS, NEWSLETTER } from "@/lib/constants";

export function Newsletter() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-lumen-purple-600 via-lumen-purple-700 to-lumen-purple-900 px-6 py-10 sm:px-12 sm:py-12 lg:px-16"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative">
            <div className="lg:col-span-3 hidden lg:block">
              <div className="relative aspect-square w-full max-w-[180px]">
                <Image
                  src={ASSETS.hero.mobile}
                  alt="Lumen device"
                  fill
                  sizes="180px"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-9">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                {NEWSLETTER.title}
              </h2>

              <form
                className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xl"
                onSubmit={(e) => e.preventDefault()}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="flex-1 h-12 rounded-full bg-white/10 backdrop-blur px-5 text-white placeholder:text-white/50 ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button type="submit" variant="secondary" size="md">
                  Submit
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
