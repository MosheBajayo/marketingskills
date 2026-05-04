"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FAQ } from "@/lib/constants";
import { cn } from "@/lib/utils";

function FaqItem({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "border-b border-white/10 transition-colors",
        isOpen && "bg-white/[0.03]",
      )}
    >
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-6 py-5 text-left text-base sm:text-lg font-semibold text-white hover:text-lumen-purple-200 transition-colors"
        >
          <span>{q}</span>
          <span
            className={cn(
              "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ring-white/30 text-white",
              isOpen && "bg-lumen-purple-500 ring-lumen-purple-500",
            )}
            aria-hidden="true"
          >
            {isOpen ? (
              <Minus className="h-3.5 w-3.5" strokeWidth={3} />
            ) : (
              <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            )}
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-12 text-sm sm:text-base text-white/75 leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-lumen-dark text-white">
      <Container size="md">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            FAQ
          </h2>
        </div>

        <div className="mt-12 lg:mt-16">
          {FAQ.map((item, i) => (
            <FaqItem
              key={item.question}
              q={item.question}
              a={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
