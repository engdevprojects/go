import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  /** Accessible label. Omit when a visible label sits next to the spinner. */
  label?: string;
  className?: string;
}

const SIZES = { sm: "size-4 border-2", md: "size-6 border-2", lg: "size-9 border-[3px]" } as const;

/** Indeterminate loading indicator. Prefer skeletons for content areas. */
export function Spinner({ size = "md", label, className }: SpinnerProps) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("inline-block animate-spin rounded-full border-current border-r-transparent", SIZES[size], className)}
    />
  );
}
