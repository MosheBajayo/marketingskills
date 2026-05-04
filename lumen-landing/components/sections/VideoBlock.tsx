"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  body?: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  bgVariant?: "light" | "dark";
};

export function VideoBlock({
  title,
  body,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  bgVariant = "dark",
}: Props) {
  const isDark = bgVariant === "dark";

  return (
    <section
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        isDark ? "bg-lumen-night text-white" : "bg-white text-lumen-dark",
      )}
    >
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
        >
          <button
            type="button"
            className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-lumen-purple-100 shadow-card-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-lumen-purple-400 order-2 lg:order-1"
            aria-label="Play video"
          >
            {thumbnailSrc ? (
              <Image
                src={thumbnailSrc}
                alt={thumbnailAlt}
                fill
                sizes="(max-width: 1024px) 90vw, 600px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-lumen-purple-500 to-lumen-purple-800"
              />
            )}
            <span className="absolute inset-0 bg-black/20" aria-hidden="true" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Play
                  className="h-7 w-7 sm:h-9 sm:w-9 text-lumen-purple-700 fill-lumen-purple-700"
                  aria-hidden="true"
                />
              </span>
            </span>
          </button>

          <div className="order-1 lg:order-2">
            <h2
              className={cn(
                "font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight",
                isDark ? "text-white" : "text-lumen-dark",
              )}
            >
              {title}
            </h2>
            {body ? (
              <p
                className={cn(
                  "mt-4 text-base sm:text-lg leading-relaxed",
                  isDark ? "text-white/80" : "text-lumen-gray",
                )}
              >
                {body}
              </p>
            ) : null}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
