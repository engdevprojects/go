import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Initials avatar. Uses no photo, so no personal image data is needed.
 * @param name Display name; the first letters of up to two words are shown.
 */
export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-ink-inverse",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-16 text-xl",
        className,
      )}
    >
      {initials}
    </span>
  );
}

interface ProgressBarProps {
  /** 0–1 */
  value: number;
  label: string;
  /** Visible value text, e.g. "24 of 30 days". */
  valueText?: string;
  tone?: "brand" | "accent" | "warning" | "danger";
  className?: string;
}

/** Determinate progress bar with proper progressbar semantics. */
export function ProgressBar({ value, label, valueText, tone = "brand", className }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuetext={valueText}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-muted", className)}
    >
      <div
        className={cn(
          "animate-grow-x h-full rounded-full transition-[width] duration-[var(--duration-slow)]",
          tone === "brand" && "bg-brand",
          tone === "accent" && "bg-accent",
          tone === "warning" && "bg-warning-fill",
          tone === "danger" && "bg-danger",
        )}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}

/**
 * Page-level notice explaining that a screen uses demo data or simulated
 * behaviour. Every financial or provider screen shows one.
 */
export function DemoNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <aside
      aria-label="Demo notice"
      className={cn("flex items-start gap-2.5 rounded-md border border-warning-border bg-warning-soft px-4 py-3 text-sm text-ink", className)}
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <p className="min-w-0">{children}</p>
    </aside>
  );
}

/** Label/value row for receipts and summaries. */
export function DetailRow({ label, value, emphasis }: { label: ReactNode; value: ReactNode; emphasis?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-2.5", emphasis && "border-t border-border pt-3.5")}>
      <dt className={cn("text-sm", emphasis ? "font-semibold text-ink" : "text-ink-muted")}>{label}</dt>
      <dd className={cn("tabular text-right text-sm", emphasis ? "type-amount text-base text-ink" : "font-medium text-ink")}>{value}</dd>
    </div>
  );
}
