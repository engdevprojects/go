import type { Money } from "./money";

/** Every kind of wallet movement shown in the demo ledger. */
export type TransactionType =
  | "top_up"
  | "payment"
  | "tip"
  | "mobile_money"
  | "esim_purchase"
  | "activation_fee"
  | "extension_fee"
  | "refund";

/** Lifecycle state of a transaction. */
export type TransactionStatus = "completed" | "pending" | "failed" | "reversed";

/** Spending category used by analytics. Top-ups and refunds have no category. */
export type SpendingCategory =
  | "food_dining"
  | "transport"
  | "activities"
  | "shopping"
  | "connectivity"
  | "transfers"
  | "tips"
  | "service_fees";

/** Who was on the other side of a transaction. */
export interface Counterparty {
  name: string;
  kind: "merchant" | "person" | "provider" | "card";
  /** Already-masked identifier, e.g. a merchant code or "•••• 4242". */
  identifier?: string;
}

/**
 * One entry in the demo ledger.
 *
 * `walletAmountRwf` is the signed effect on the RWF wallet balance in whole
 * francs. Charges taken from a card (the activation fee) have
 * `walletAmountRwf: 0` and carry the card amount in `sourceAmount` instead —
 * so the balance is always the plain sum of `walletAmountRwf`.
 */
export interface Transaction {
  id: string;
  /** Human-readable demo reference shown on receipts. */
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  title: string;
  category: SpendingCategory | null;
  counterparty?: Counterparty;
  walletAmountRwf: number;
  /** Amount charged to (or refunded to) the visitor's card, in its currency. */
  sourceAmount?: Money;
  /** Fee charged on the card, shown separately from the amount. */
  feeAmount?: Money;
  /** Sample rate used: RWF per 1 unit of the source currency, x1000. */
  fxRateMilli?: number;
  /** Tip details for tips and payments that included one. */
  tip?: { percent: number | null; amountRwf: number };
  createdAt: string;
  note?: string;
  /** `seed` = fixed demo data, `session` = created by a demo flow in this browser. */
  origin: "seed" | "session";
}

/** Input accepted when a demo flow records a new transaction. */
export type NewTransactionInput = Omit<Transaction, "id" | "reference" | "createdAt" | "origin">;
