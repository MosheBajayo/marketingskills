import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  dot = true,
}: {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 border border-white/15 bg-carbon-900 px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-300",
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 bg-volt-500" aria-hidden />}
      {children}
    </span>
  );
}
