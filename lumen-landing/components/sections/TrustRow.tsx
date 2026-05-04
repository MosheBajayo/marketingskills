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
    <section className="bg-lumen-night text-white">
      <Container size="xl" className="py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {TRUST_BADGES.map((badge, i) => {
            const Icon = ICONS[badge.icon];
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center justify-center text-center gap-3 py-4 px-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lumen-purple-600/15 ring-1 ring-lumen-purple-500/40 text-lumen-purple-300">
                  {Icon ? (
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  ) : null}
                </div>
                <h3 className="text-sm font-semibold text-white">
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
