import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Supporting line, e.g. the basis of the figure. */
  detail?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/** A single headline metric (analytics summary card). */
export function StatCard({ label, value, detail, icon, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5 shadow-card", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="type-overline text-ink-subtle">{label}</p>
        {icon ? (
          <span className="text-ink-subtle [&_svg]:size-4" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="type-amount mt-2 text-2xl text-ink">{value}</p>
      {detail ? <p className="type-caption mt-1 text-ink-muted">{detail}</p> : null}
    </div>
  );
}
