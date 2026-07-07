import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p
            className={cn(
              "mb-4 flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.3em] text-volt-500",
              align === "center" && "justify-center",
            )}
          >
            <span className="inline-block h-px w-8 bg-volt-500" aria-hidden />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="font-display text-balance text-4xl font-bold uppercase leading-[0.95] tracking-tightest text-white sm:text-5xl md:text-6xl">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p className="mt-5 text-pretty text-base leading-relaxed text-neutral-400 sm:text-lg">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
