/** ISO 4217 codes supported by the demo. RWF is the wallet currency. */
export type CurrencyCode = "RWF" | "USD" | "EUR" | "GBP";

/** Home (card) currencies a visitor can top up from in the demo. */
export type ForeignCurrencyCode = Exclude<CurrencyCode, "RWF">;

/**
 * A monetary value in integer minor units, always paired with its currency.
 * Example: `{ amountMinor: 5000, currency: "USD" }` is USD 50.00; RWF has no
 * minor unit in use, so `{ amountMinor: 70000, currency: "RWF" }` is RWF 70,000.
 */
export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

/** Money known to be in a foreign (card) currency — never RWF. */
export interface ForeignMoney extends Money {
  currency: ForeignCurrencyCode;
}
