"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HOME_ASSETS, HOME_NEWSLETTER } from "@/lib/home-content";

export function HomeNewsletter() {
  return (
    <section className="bg-lumen-night py-12 sm:py-16 lg:py-20">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-4 relative aspect-[5/3] lg:aspect-auto lg:min-h-[280px]">
              <Image
                src={HOME_ASSETS.newsletter}
                alt="Person using Lumen device"
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover"
              />
            </div>

            <div className="lg:col-span-8 px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {HOME_NEWSLETTER.title}
                <br />
                <span className="text-white">{HOME_NEWSLETTER.subtitle}</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/70 max-w-md">
                {HOME_NEWSLETTER.body}
              </p>

              <form
                className="mt-6 flex flex-col sm:flex-row gap-3 max-w-lg"
                onSubmit={(e) => e.preventDefault()}
              >
                <label htmlFor="home-newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="home-newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email"
                  className="flex-1 h-12 rounded-full bg-white px-5 text-lumen-dark placeholder:text-lumen-gray focus:outline-none focus:ring-2 focus:ring-lumen-purple-400"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="sm:px-10 uppercase tracking-[0.18em]"
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
