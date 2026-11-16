import { cn } from "@/lib/cn";
import { formatRwf } from "@/lib/money";
import type { DailySpendPoint } from "@/types/analytics";

/**
 * Lightweight daily-spend bar chart built from an ordered list, so it needs
 * no chart library and is read naturally by screen readers (each bar is a
 * list item with its day and amount).
 */
export function SpendBars({ days, highlightLast = true, className }: { days: DailySpendPoint[]; highlightLast?: boolean; className?: string }) {
  const max = Math.max(1, ...days.map((day) => day.spentRwf));
  return (
    <ol className={cn("flex h-32 items-end gap-1.5 sm:gap-2", className)} aria-label="Daily spending">
      {days.map((day, index) => {
        const height = day.spentRwf === 0 ? 4 : Math.max(8, Math.round((day.spentRwf / max) * 100));
        const last = highlightLast && index === days.length - 1;
        return (
          <li key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <span className="sr-only">
              {day.label}: {formatRwf(day.spentRwf)}
            </span>
            <span
              aria-hidden="true"
              title={`${day.label}: ${formatRwf(day.spentRwf)}`}
              className={cn("animate-grow-y w-full max-w-9 rounded-t-sm transition-[height] duration-[var(--duration-slow)]", last ? "bg-brand" : "bg-brand-soft-strong", day.spentRwf === 0 && "bg-surface-muted")}
              style={{ height: `${height}%`, animationDelay: `${index * 40}ms` }}
            />
            <span aria-hidden="true" className="type-caption w-full truncate text-center text-[0.6875rem] text-ink-subtle">
              {day.label.split(" ")[0]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
