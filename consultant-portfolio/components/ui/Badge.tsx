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
        "inline-flex items-center gap-2 rounded-full border border-ink-600/80 bg-ink-800/60 px-3.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur",
        className,
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-400" />
        </span>
      )}
      {children}
    </span>
  );
}
