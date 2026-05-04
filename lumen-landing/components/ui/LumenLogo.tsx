import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "white" | "dark";
};

export function LumenLogo({ className }: Props) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label="Lumen"
    >
      <Image
        src="/lumen-logo.webp"
        alt="Lumen"
        width={120}
        height={36}
        priority
        className="h-7 w-auto"
      />
    </span>
  );
}
