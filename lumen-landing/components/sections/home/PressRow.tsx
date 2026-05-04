"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { PRESS_ITEMS } from "@/lib/home-content";

export function PressRow() {
  return (
    <section className="bg-lumen-night py-10 sm:py-14">
      <Container size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {PRESS_ITEMS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-5 py-5"
            >
              <p className="font-display text-base font-extrabold text-white">
                {item.name}
              </p>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                {item.blurb}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
