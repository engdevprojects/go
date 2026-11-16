"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatRwf } from "@/lib/money";
import type { DailySpendPoint } from "@/types/analytics";

/** Compact axis labels: 12,500 → "12.5k". */
function compactRwf(value: number): string {
  return value >= 1000 ? `${Number((value / 1000).toFixed(1))}k` : String(value);
}

/**
 * Daily spending bar chart (Recharts). Purely visual — the parent provides
 * the text summary and data table that assistive technology uses, so the
 * SVG is hidden from screen readers.
 */
export default function SpendingTrendChart({ data }: { data: DailySpendPoint[] }) {
  return (
    <div className="h-64 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--color-ink-subtle)", fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={compactRwf} tick={{ fill: "var(--color-ink-subtle)", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "var(--color-surface-muted)" }}
            formatter={(value) => [formatRwf(typeof value === "number" ? value : Number(value)), "Spent"]}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-raised)", fontSize: 13 }}
          />
          <Bar dataKey="spentRwf" name="Spent" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
