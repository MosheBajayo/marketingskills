"use client";

import { motion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
} & MotionProps;

export function SectionWrapper({
  children,
  className,
  id,
  as = "section",
  ...motionProps
}: Props) {
  const Component = as === "section" ? motion.section : motion.div;
  return (
    <Component
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("py-16 sm:py-20 lg:py-28", className)}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
