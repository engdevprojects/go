import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  brand: "bg-brand-soft text-brand-strong",
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

interface BadgeProps {
  tone?: BadgeTone;
  /** Optional leading icon; status is always also conveyed by the text. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Compact status or category label. Never rely on its colour alone. */
export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** The standard "Demo" marker used next to simulated data and actions. */
export function DemoBadge({ label = "Demo", className }: { label?: string; className?: string }) {
  return (
    <Badge tone="warning" icon={<FlaskConical aria-hidden="true" />} className={className}>
      {label}
    </Badge>
  );
}
