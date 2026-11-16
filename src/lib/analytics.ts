import { formatShortDay, kigaliDayKey, lastDayKeys } from "@/lib/dates";
import { CATEGORY_LABELS } from "@/lib/ledger";
import type { AnalyticsRange, AnalyticsSummary, CategorySpend, DailySpendPoint } from "@/types/analytics";
import type { CurrencyCode, Money } from "@/types/money";
import type { SpendingCategory, Transaction } from "@/types/transaction";

/**
 * Spending analytics derived only from the ledger.
 *
 * Basis (documented so totals are never ambiguous):
 * - "Spend" = completed wallet debits with a category. Pending and failed are
 *   excluded. All spend figures are RWF, the wallet currency.
 * - Card charges (top-ups and card-paid fees) stay in their own currencies and
 *   are summed per currency, never across currencies.
 */

export const ANALYTICS_RANGES: readonly { value: AnalyticsRange; label: string; days: number | null }[] = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "14d", label: "Last 14 days", days: 14 },
  { value: "all", label: "Whole trip", days: null },
];

/** Whether a transaction counts as wallet spend. */
export function isWalletSpend(transaction: Transaction): boolean {
  return transaction.status === "completed" && transaction.walletAmountRwf < 0 && transaction.category !== null;
}

/**
 * Computes the analytics summary for a range ending at `now`.
 * @param transactions Full ledger.
 * @param range Time window.
 * @param now Demo clock.
 */
export function computeAnalytics(transactions: readonly Transaction[], range: AnalyticsRange, now: Date): AnalyticsSummary {
  const nowKey = kigaliDayKey(now);
  const inPast = transactions.filter((transaction) => kigaliDayKey(transaction.createdAt) <= nowKey);
  const rangeDays = ANALYTICS_RANGES.find((option) => option.value === range)?.days ?? null;

  let dayKeys: string[];
  if (rangeDays !== null) {
    dayKeys = lastDayKeys(now, rangeDays);
  } else {
    const earliest = inPast.reduce<string>((min, transaction) => {
      const key = kigaliDayKey(transaction.createdAt);
      return key < min ? key : min;
    }, nowKey);
    const spanDays = Math.round((Date.parse(nowKey) - Date.parse(earliest)) / 86_400_000) + 1;
    dayKeys = lastDayKeys(now, spanDays);
  }
  const firstKey = dayKeys[0] ?? nowKey;
  const windowed = inPast.filter((transaction) => kigaliDayKey(transaction.createdAt) >= firstKey);
  const spend = windowed.filter(isWalletSpend);

  const dailyMap = new Map<string, number>(dayKeys.map((key) => [key, 0]));
  const categoryMap = new Map<SpendingCategory, { spentRwf: number; count: number }>();
  let totalSpentRwf = 0;
  let largestSpendRwf = 0;

  for (const transaction of spend) {
    const amount = -transaction.walletAmountRwf;
    totalSpentRwf += amount;
    largestSpendRwf = Math.max(largestSpendRwf, amount);
    const key = kigaliDayKey(transaction.createdAt);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + amount);
    if (transaction.category) {
      const current = categoryMap.get(transaction.category) ?? { spentRwf: 0, count: 0 };
      categoryMap.set(transaction.category, { spentRwf: current.spentRwf + amount, count: current.count + 1 });
    }
  }

  const daily: DailySpendPoint[] = dayKeys.map((key) => ({
    date: key,
    label: formatShortDay(`${key}T12:00:00+02:00`),
    spentRwf: dailyMap.get(key) ?? 0,
  }));

  const categories: CategorySpend[] = [...categoryMap.entries()]
    .map(([category, value]) => ({
      category,
      label: CATEGORY_LABELS[category],
      spentRwf: value.spentRwf,
      count: value.count,
      share: totalSpentRwf === 0 ? 0 : value.spentRwf / totalSpentRwf,
    }))
    .sort((a, b) => b.spentRwf - a.spentRwf);

  const totalAddedRwf = windowed
    .filter((transaction) => transaction.status === "completed" && transaction.walletAmountRwf > 0)
    .reduce((total, transaction) => total + transaction.walletAmountRwf, 0);

  const cardTotals = new Map<CurrencyCode, number>();
  for (const transaction of windowed) {
    if (transaction.status !== "completed") continue;
    if (transaction.type !== "top_up" && transaction.type !== "activation_fee" && transaction.type !== "extension_fee") continue;
    for (const money of [transaction.sourceAmount, transaction.feeAmount]) {
      if (money) cardTotals.set(money.currency, (cardTotals.get(money.currency) ?? 0) + money.amountMinor);
    }
  }
  const cardChargesByCurrency: Money[] = [...cardTotals.entries()].map(([currency, amountMinor]) => ({ currency, amountMinor }));

  return {
    range,
    totalSpentRwf,
    spendCount: spend.length,
    averageSpendRwf: spend.length === 0 ? 0 : Math.round(totalSpentRwf / spend.length),
    largestSpendRwf,
    totalAddedRwf,
    topCategory: categories[0] ?? null,
    daily,
    categories,
    cardChargesByCurrency,
  };
}
