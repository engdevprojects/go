import type { Money } from "./money";
import type { SpendingCategory } from "./transaction";

/** Analytics time windows, relative to the demo clock. */
export type AnalyticsRange = "7d" | "14d" | "all";

/** Spend on one calendar day (Kigali time). */
export interface DailySpendPoint {
  /** YYYY-MM-DD in Africa/Kigali. */
  date: string;
  label: string;
  spentRwf: number;
}

/** Spend in one category. */
export interface CategorySpend {
  category: SpendingCategory;
  label: string;
  spentRwf: number;
  count: number;
  /** Share of total spend, 0–1. */
  share: number;
}

/**
 * Summary of completed wallet spending. All wallet figures are RWF; card
 * charges keep their own currencies and are never summed across currencies.
 */
export interface AnalyticsSummary {
  range: AnalyticsRange;
  totalSpentRwf: number;
  spendCount: number;
  averageSpendRwf: number;
  largestSpendRwf: number;
  totalAddedRwf: number;
  topCategory: CategorySpend | null;
  daily: DailySpendPoint[];
  categories: CategorySpend[];
  /** Card charges (top-ups + fees) grouped per currency. */
  cardChargesByCurrency: Money[];
}
