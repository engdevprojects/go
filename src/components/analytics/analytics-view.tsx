"use client";

import { ArrowDownLeft, BarChart3, Hash, Scale, Trophy, Wallet } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { StatCard } from "@/components/finance/stat-card";
import { TransactionRow } from "@/components/finance/transaction-row";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DemoNotice } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/skeleton";
import { ANALYTICS_RANGES, computeAnalytics, isWalletSpend } from "@/lib/analytics";
import { formatDate, kigaliDayKey } from "@/lib/dates";
import { formatMoney, formatRwf } from "@/lib/money";
import { useDemoStore } from "@/lib/store/demo-store";
import type { AnalyticsRange } from "@/types/analytics";

const SpendingTrendChart = dynamic(() => import("@/components/analytics/spending-trend-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const CATEGORY_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5", "bg-chart-6"] as const;

/**
 * Spending analytics derived from the shared ledger. All spend is RWF;
 * card charges are listed per currency and never added together.
 */
export function AnalyticsView() {
  const { transactions, now } = useDemoStore();
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const summary = useMemo(() => computeAnalytics(transactions, range, now), [transactions, range, now]);
  const firstDay = summary.daily[0]?.date ?? kigaliDayKey(now);
  const recentSpend = useMemo(
    () => transactions.filter((transaction) => isWalletSpend(transaction) && kigaliDayKey(transaction.createdAt) >= firstDay).slice(0, 5),
    [transactions, firstDay],
  );
  const busiest = summary.daily.reduce((best, day) => (day.spentRwf > best.spentRwf ? day : best), summary.daily[0] ?? { date: "", label: "", spentRwf: 0 });
  const rangeLabel = ANALYTICS_RANGES.find((option) => option.value === range)?.label.toLowerCase() ?? "";

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Where your wallet money goes, built from your transaction history."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }]}
        actions={
          <SegmentedControl label="Time range" hideLabel name="analytics-range" value={range} options={ANALYTICS_RANGES} onChange={setRange} size="sm" />
        }
      />
      <DemoNotice className="mb-6">
        Calculated from your demo transactions. Spending means completed wallet payments, tips, transfers and data — in RWF. Pending and failed
        payments aren&apos;t counted.
      </DemoNotice>

      {summary.spendCount === 0 ? (
        <Card>
          <EmptyState
            headingLevel="h2"
            icon={<BarChart3 />}
            title="No spending in this period"
            description="Try a longer time range, or make a demo payment to see it here."
            action={<ButtonLink href="/services/pay-tip">Make a demo payment</ButtonLink>}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total spent" value={formatRwf(summary.totalSpentRwf)} detail={rangeLabel} icon={<Wallet />} />
            <StatCard label="Payments" value={summary.spendCount} detail="Completed debits" icon={<Hash />} />
            <StatCard label="Average" value={formatRwf(summary.averageSpendRwf)} detail="Per payment" icon={<Scale />} />
            <StatCard label="Largest" value={formatRwf(summary.largestSpendRwf)} detail="Single payment" icon={<Trophy />} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card as="section" aria-labelledby="trend-heading" aria-describedby="trend-summary">
              <CardHeader id="trend-heading" title="Daily spending" description="RWF per day, Kigali time" />
              <p id="trend-summary" className="sr-only">
                {`Over the ${rangeLabel}, you spent ${formatRwf(summary.totalSpentRwf)}. The busiest day was ${busiest.label} with ${formatRwf(busiest.spentRwf)}.`}
              </p>
              <SpendingTrendChart data={summary.daily} />
              <details className="group mt-4">
                <summary className="focus-ring cursor-pointer rounded-sm text-sm font-semibold text-brand-strong">View as table</summary>
                <table className="mt-3 w-full text-sm">
                  <caption className="sr-only">Daily spending in Rwandan francs</caption>
                  <thead>
                    <tr className="text-left text-ink-subtle">
                      <th scope="col" className="pb-2 font-medium">Day</th>
                      <th scope="col" className="pb-2 text-right font-medium">Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summary.daily.map((day) => (
                      <tr key={day.date}>
                        <th scope="row" className="py-2 text-left font-normal text-ink">{day.label}</th>
                        <td className="tabular py-2 text-right text-ink">{formatRwf(day.spentRwf)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </Card>

            <Card as="section" aria-labelledby="categories-heading">
              <CardHeader id="categories-heading" title="By category" description="Share of total spending" />
              <ul className="space-y-4">
                {summary.categories.map((category, index) => (
                  <li key={category.category}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <span aria-hidden="true" className={`size-2.5 rounded-full ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}`} />
                        {category.label}
                      </span>
                      <span className="tabular text-ink">{formatRwf(category.spentRwf)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
                      <div className={`h-full rounded-full ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}`} style={{ width: `${Math.max(2, category.share * 100)}%` }} />
                    </div>
                    <p className="type-caption mt-1 text-ink-subtle">
                      {Math.round(category.share * 100)}% · {category.count} {category.count === 1 ? "payment" : "payments"}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card as="section" aria-labelledby="recent-spend-heading">
              <CardHeader id="recent-spend-heading" title="Recent spending" description={`Latest in the ${rangeLabel}`} />
              <div className="divide-y divide-border">
                {recentSpend.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} showDate={formatDate(transaction.createdAt)} />
                ))}
              </div>
            </Card>

            <Card as="section" aria-labelledby="money-in-heading">
              <CardHeader id="money-in-heading" title="Money in" description="Kept separate by currency" />
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-success-soft text-success" aria-hidden="true">
                  <ArrowDownLeft className="size-5" />
                </span>
                <div>
                  <p className="type-amount text-xl text-ink">{formatRwf(summary.totalAddedRwf)}</p>
                  <p className="type-caption text-ink-muted">Added to the wallet</p>
                </div>
              </div>
              <h3 className="type-overline mt-6 mb-2 text-ink-subtle">Charged to cards</h3>
              {summary.cardChargesByCurrency.length === 0 ? (
                <p className="type-caption text-ink-muted">No card charges in this period.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {summary.cardChargesByCurrency.map((money) => (
                    <li key={money.currency} className="flex justify-between py-2 text-sm">
                      <span className="text-ink-muted">{money.currency}</span>
                      <span className="tabular font-semibold text-ink">{formatMoney(money)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="type-caption mt-3 text-ink-subtle">Includes top-ups, top-up fees and card-paid fees. Different currencies are never added together.</p>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
