"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

type Props = {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  cta?: { label: string; href: string };
  bg?: "night" | "darker" | "transparent";
  imageContain?: boolean;
  imageAspect?: string;
  containerSize?: "lg" | "xl" | "md";
};

export function SplitSection({
  title,
  body,
  imageSrc,
  imageAlt,
  reverse = false,
  cta,
  bg = "night",
  imageContain = false,
  imageAspect = "aspect-[4/3]",
  containerSize = "xl",
}: Props) {
  return (
    <section
      className={cn(
        "py-12 sm:py-16 lg:py-20 text-white",
        bg === "night" && "bg-lumen-night",
        bg === "darker" && "bg-lumen-darker",
        bg === "transparent" && "bg-transparent",
      )}
    >
      <Container size={containerSize}>
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center",
            reverse && "lg:[&>div:first-child]:order-2",
          )}
        >
          <motion.div
            initial={{ opacity: 0, x: reverse ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-[560px] mx-auto"
          >
            <div className={cn("relative overflow-hidden rounded-3xl", imageAspect)}>
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 90vw, 560px"
                className={cn(imageContain ? "object-contain" : "object-cover")}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reverse ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-bold text-white leading-tight">
              {title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
              {body}
            </p>
            {cta ? (
              <div className="mt-7">
                <ButtonLink
                  href={cta.href}
                  size="md"
                  className="uppercase tracking-[0.18em] bg-white text-lumen-darker hover:bg-lumen-cream"
                >
                  {cta.label}
                </ButtonLink>
              </div>
            ) : null}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
