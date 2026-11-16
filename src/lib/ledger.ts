import { EXPIRY_REMINDER_DAYS, WALLET_PERIOD_DAYS } from "@/lib/config/product";
import { kigaliDayKey } from "@/lib/dates";
import type { Money } from "@/types/money";
import type { SpendingCategory, Transaction, TransactionStatus, TransactionType } from "@/types/transaction";
import type { WalletAccount, WalletStatus, WalletSummary } from "@/types/wallet";

/**
 * Pure ledger selectors. Everything the UI shows about money is derived here
 * from the transaction list, so the dashboard, history, details and analytics
 * can never disagree. Swap the data source for an API later; keep these.
 */

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  top_up: "Top-up",
  payment: "Payment",
  tip: "Tip",
  mobile_money: "Mobile money",
  esim_purchase: "Data plan",
  activation_fee: "Activation fee",
  extension_fee: "Extension fee",
  refund: "Refund",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  reversed: "Reversed",
};

export const CATEGORY_LABELS: Record<SpendingCategory, string> = {
  food_dining: "Food & dining",
  transport: "Transport",
  activities: "Tours & activities",
  shopping: "Shopping",
  connectivity: "Data & connectivity",
  transfers: "Mobile money",
  tips: "Tips",
  service_fees: "Service fees",
};

/** Filter groups offered in the transaction history. */
export type TransactionGroupFilter = "all" | "payments" | "transfers" | "top_ups" | "data" | "fees";

export const TRANSACTION_GROUP_FILTERS: readonly { value: TransactionGroupFilter; label: string; types: TransactionType[] }[] = [
  { value: "all", label: "All", types: [] },
  { value: "payments", label: "Payments & tips", types: ["payment", "tip"] },
  { value: "transfers", label: "Mobile money", types: ["mobile_money"] },
  { value: "top_ups", label: "Top-ups & refunds", types: ["top_up", "refund"] },
  { value: "data", label: "Data", types: ["esim_purchase"] },
  { value: "fees", label: "Fees", types: ["activation_fee", "extension_fee"] },
];

export type TransactionSort = "newest" | "oldest" | "amount_high" | "amount_low";
export type TransactionStatusFilter = "all" | TransactionStatus;

/** Criteria for the transaction history. */
export interface TransactionQuery {
  search: string;
  group: TransactionGroupFilter;
  status: TransactionStatusFilter;
  sort: TransactionSort;
}

export const DEFAULT_TRANSACTION_QUERY: TransactionQuery = { search: "", group: "all", status: "all", sort: "newest" };

/**
 * Whether a transaction moves the available balance. Completed entries count;
 * pending debits are reserved, so they count too. Failed and reversed don't.
 */
export function affectsBalance(transaction: Transaction): boolean {
  if (transaction.status === "completed") return true;
  return transaction.status === "pending" && transaction.walletAmountRwf < 0;
}

/** Sorts newest first without mutating the input. */
export function sortNewestFirst(transactions: readonly Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Available balance in whole RWF. */
export function computeBalanceRwf(transactions: readonly Transaction[]): number {
  return transactions.reduce((total, transaction) => (affectsBalance(transaction) ? total + transaction.walletAmountRwf : total), 0);
}

/**
 * Derives the wallet summary shown on the dashboard and wallet page.
 * @param account Static wallet facts (tier, dates).
 * @param transactions Full ledger (seed + session).
 * @param now Demo clock.
 */
export function buildWalletSummary(account: WalletAccount, transactions: readonly Transaction[], now: Date): WalletSummary {
  const expired = now.getTime() >= Date.parse(account.expiresAt);
  const elapsedDays = Math.floor((now.getTime() - Date.parse(account.activatedAt)) / 86_400_000);
  const dayNumber = Math.min(WALLET_PERIOD_DAYS, Math.max(1, elapsedDays + 1));
  const daysRemaining = expired ? 0 : WALLET_PERIOD_DAYS - dayNumber;
  let status: WalletStatus = "active";
  if (expired) status = "expired";
  // "Expiring soon" from the first reminder day (UR-21: day 25).
  else if (dayNumber >= EXPIRY_REMINDER_DAYS[0]) status = "expiring_soon";

  let totalAddedRwf = 0;
  let totalSpentRwf = 0;
  for (const transaction of transactions) {
    if (!affectsBalance(transaction)) continue;
    if (transaction.walletAmountRwf > 0) totalAddedRwf += transaction.walletAmountRwf;
    else totalSpentRwf += -transaction.walletAmountRwf;
  }

  return {
    ...account,
    status,
    balanceRwf: computeBalanceRwf(transactions),
    dayNumber,
    daysRemaining,
    totalAddedRwf,
    totalSpentRwf,
  };
}

/**
 * The amount to headline for a transaction: the wallet movement in RWF, or for
 * card-only charges (activation fee) the negative card amount.
 */
export function headlineAmount(transaction: Transaction): { money: Money; onCard: boolean } {
  if (transaction.walletAmountRwf !== 0 || !transaction.sourceAmount) {
    return { money: { amountMinor: transaction.walletAmountRwf, currency: "RWF" }, onCard: false };
  }
  return { money: { ...transaction.sourceAmount, amountMinor: -transaction.sourceAmount.amountMinor }, onCard: true };
}

/** Lower-cased text a search query is matched against. */
function searchableText(transaction: Transaction): string {
  return [
    transaction.title,
    transaction.reference,
    transaction.counterparty?.name,
    transaction.counterparty?.identifier,
    TRANSACTION_TYPE_LABELS[transaction.type],
    transaction.category ? CATEGORY_LABELS[transaction.category] : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Applies search, group, status, and sort to the ledger.
 * Amount sorting uses the absolute RWF movement (card-only fees sort as 0).
 */
export function queryTransactions(transactions: readonly Transaction[], query: TransactionQuery): Transaction[] {
  const search = query.search.trim().toLowerCase();
  const groupTypes = TRANSACTION_GROUP_FILTERS.find((group) => group.value === query.group)?.types ?? [];

  const filtered = transactions.filter((transaction) => {
    if (groupTypes.length > 0 && !groupTypes.includes(transaction.type)) return false;
    if (query.status !== "all" && transaction.status !== query.status) return false;
    return search === "" || searchableText(transaction).includes(search);
  });

  return filtered.sort((a, b) => {
    switch (query.sort) {
      case "oldest":
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
      case "amount_high":
        return Math.abs(b.walletAmountRwf) - Math.abs(a.walletAmountRwf);
      case "amount_low":
        return Math.abs(a.walletAmountRwf) - Math.abs(b.walletAmountRwf);
      case "newest":
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
  });
}

/** A run of transactions on one Kigali calendar day. */
export interface TransactionDayGroup {
  dayKey: string;
  firstIso: string;
  transactions: Transaction[];
}

/**
 * Groups an already-sorted list into consecutive Kigali-day buckets, keeping
 * the existing order (so it works for both date and amount sorting).
 */
export function groupByDay(transactions: readonly Transaction[]): TransactionDayGroup[] {
  const groups: TransactionDayGroup[] = [];
  for (const transaction of transactions) {
    const dayKey = kigaliDayKey(transaction.createdAt);
    const last = groups.at(-1);
    if (last && last.dayKey === dayKey) last.transactions.push(transaction);
    else groups.push({ dayKey, firstIso: transaction.createdAt, transactions: [transaction] });
  }
  return groups;
}

/**
 * Builds the next demo reference, e.g. "DEMO-0411-0018".
 * @param now Demo clock (month/day come from Kigali time).
 * @param sequence 1-based ledger position.
 */
export function buildReference(now: Date, sequence: number): string {
  const [, month = "00", day = "00"] = kigaliDayKey(now).split("-");
  return `DEMO-${month}${day}-${String(sequence).padStart(4, "0")}`;
}
