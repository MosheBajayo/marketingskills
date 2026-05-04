"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { CheckBullet } from "@/components/ui/CheckBullet";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  bullets: string[];
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  footer?: React.ReactNode;
};

export function FeatureSection({
  eyebrow,
  title,
  description,
  bullets,
  imageSrc,
  imageAlt,
  reverse = false,
  footer,
}: Props) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-lumen-night text-white">
      <Container size="xl">
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center",
            reverse && "lg:[&>div:first-child]:order-2",
          )}
        >
          <motion.div
            initial={{ opacity: 0, x: reverse ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-[520px] mx-auto"
          >
            <div className="relative aspect-[4/3] rounded-4xl overflow-hidden bg-gradient-to-br from-lumen-purple-900/60 to-lumen-purple-700/40 shadow-purple-glow ring-1 ring-lumen-purple-500/40">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reverse ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {eyebrow ? (
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-lumen-purple-300">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white whitespace-pre-line">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 text-base sm:text-lg text-white/70 leading-relaxed">
                {description}
              </p>
            ) : null}
            <ul className="mt-8 space-y-4 text-white/85">
              {bullets.map((b) => (
                <CheckBullet key={b} variant="dark">
                  {b}
                </CheckBullet>
              ))}
            </ul>
            {footer ? <div className="mt-8">{footer}</div> : null}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
