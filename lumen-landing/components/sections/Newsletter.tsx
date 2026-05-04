"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ASSETS } from "@/lib/constants";

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
            <div className="lg:col-span-4 hidden lg:block">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
                <Image
                  src={ASSETS.realtime.desktop}
                  alt="Person using the Lumen device"
                  fill
                  sizes="(max-width: 1024px) 90vw, 320px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                Sign up to our newsletter
                <br />
                and receive{" "}
                <span className="text-white">$25 off</span>
              </h2>

              <form
                className="mt-6 flex flex-col sm:flex-row gap-3"
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
                  placeholder="Email"
                  className="flex-1 h-12 rounded-full bg-white px-5 text-lumen-dark placeholder:text-lumen-gray focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="sm:px-10 uppercase tracking-wider"
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
