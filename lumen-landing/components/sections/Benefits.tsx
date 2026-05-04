"use client";

import { motion } from "framer-motion";
import {
  TrendingDown,
  Apple,
  Zap,
  Heart,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BENEFITS } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  TrendingDown,
  Apple,
  Zap,
  Heart,
  ShieldCheck,
};

export function Benefits() {
  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-lumen-night text-white">
      <Container size="lg">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Benefits of enhancing your metabolism
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
            Your metabolism can be improved, just like your body gets stronger
            and more fit from working out. Improving your metabolism&rsquo;s
            efficiency leads to:
          </p>
        </div>

        <ul className="mt-12 lg:mt-16 max-w-3xl mx-auto divide-y divide-white/10">
          {BENEFITS.map((b, i) => {
            const Icon = ICONS[b.icon] ?? TrendingDown;
            return (
              <motion.li
                key={b.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="flex items-start gap-5 py-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lumen-purple-600/20 ring-1 ring-lumen-purple-500/40 text-lumen-purple-300">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-sm sm:text-base text-white/70 leading-relaxed">
                    {b.content}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
