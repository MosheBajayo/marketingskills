import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "purple" | "white" | "dark";
};

export function CheckBullet({
  children,
  className,
  variant = "purple",
}: Props) {
  return (
    <li className={cn("flex items-start gap-3", className)}>
      <span
        className={cn(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          variant === "purple" && "bg-lumen-purple-100 text-lumen-purple-700",
          variant === "white" && "bg-white/20 text-white",
          variant === "dark" &&
            "bg-lumen-purple-600/20 text-lumen-purple-300 ring-1 ring-lumen-purple-500/40",
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      </span>
      <span className="text-base leading-relaxed">{children}</span>
    </li>
  );
}
