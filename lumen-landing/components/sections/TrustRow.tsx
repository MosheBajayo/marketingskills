"use client";

import { motion } from "framer-motion";
import { RotateCcw, Headphones, Truck, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TRUST_BADGES } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  RotateCcw,
  Headphones,
  Truck,
};

export function TrustRow() {
  return (
    <section className="py-12 sm:py-16 bg-lumen-night border-y border-white/10 text-white">
      <Container size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {TRUST_BADGES.map((badge, i) => {
            const Icon = ICONS[badge.icon];
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center justify-center text-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center text-white">
                  {Icon ? (
                    <Icon className="h-8 w-8" strokeWidth={1.6} />
                  ) : null}
                </div>
                <h3 className="text-base font-semibold text-white">
                  {badge.title}
                </h3>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
