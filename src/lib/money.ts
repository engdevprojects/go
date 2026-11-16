import type { CurrencyCode, Money } from "@/types/money";

/** Minor-unit digits per currency (ISO 4217; RWF is used without decimals). */
const MINOR_DIGITS: Record<CurrencyCode, number> = { RWF: 0, USD: 2, EUR: 2, GBP: 2 };

/** Display symbols used alongside the ISO code in compact contexts. */
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = { RWF: "FRw", USD: "$", EUR: "€", GBP: "£" };

/** Human-readable currency names. */
export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  RWF: "Rwandan franc",
  USD: "US dollar",
  EUR: "Euro",
  GBP: "British pound",
};

/**
 * Returns 10^digits for a currency — the minor units in one major unit.
 * @param currency ISO 4217 code.
 */
export function minorFactor(currency: CurrencyCode): number {
  return 10 ** MINOR_DIGITS[currency];
}

/**
 * Parses a user-typed decimal string into integer minor units without
 * floating-point arithmetic. Returns `null` for anything that is not a plain
 * non-negative amount with at most the currency's decimal places.
 *
 * @example parseAmountToMinor("12.5", "USD") // 1250
 * @example parseAmountToMinor("1,000", "RWF") // 1000
 */
export function parseAmountToMinor(input: string, currency: CurrencyCode): number | null {
  const cleaned = input.trim().replace(/[,\s]/g, "");
  const digits = MINOR_DIGITS[currency];
  const pattern = digits === 0 ? /^\d+$/ : new RegExp(`^\\d+(\\.\\d{1,${digits}})?$`);
  if (!pattern.test(cleaned)) return null;
  const [whole = "0", fraction = ""] = cleaned.split(".");
  const minor = Number(whole) * minorFactor(currency) + Number(fraction.padEnd(digits, "0") || "0");
  return Number.isSafeInteger(minor) ? minor : null;
}

/**
 * Formats money for display, e.g. "USD 50.00" or "RWF 18,500".
 * Formatting is presentation only — never parse the result back.
 *
 * @param money Amount in minor units with its currency.
 * @param options.signed Prefix "+" for positive values (minus is always shown).
 * @param options.compact Use the currency symbol instead of the ISO code.
 */
export function formatMoney(money: Money, options: { signed?: boolean; compact?: boolean } = {}): string {
  const digits = MINOR_DIGITS[money.currency];
  const major = Math.abs(money.amountMinor) / minorFactor(money.currency);
  const number = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(major);
  const sign = money.amountMinor < 0 ? "−" : options.signed && money.amountMinor > 0 ? "+" : "";
  const unit = options.compact ? CURRENCY_SYMBOLS[money.currency] : money.currency;
  return options.compact && money.currency !== "RWF" ? `${sign}${unit}${number}` : `${sign}${unit} ${number}`;
}

/**
 * Formats whole Rwandan francs, e.g. `formatRwf(-18500)` → "−RWF 18,500".
 * @param amountRwf Integer francs.
 * @param signed Prefix "+" for positive values.
 */
export function formatRwf(amountRwf: number, signed = false): string {
  return formatMoney({ amountMinor: amountRwf, currency: "RWF" }, { signed });
}

/**
 * Formats a USD minor-unit amount, e.g. `formatUsd(500)` → "USD 5.00".
 * @param amountMinor US cents.
 */
export function formatUsd(amountMinor: number): string {
  return formatMoney({ amountMinor, currency: "USD" });
}

/**
 * Applies a rate in basis points, rounding up so a fee is never under-charged.
 * @param amountMinor Base amount in minor units.
 * @param basisPoints 100 bp = 1%.
 */
export function applyBasisPointsCeil(amountMinor: number, basisPoints: number): number {
  return Math.ceil((amountMinor * basisPoints) / 10_000);
}

/**
 * Computes a percentage of a whole-franc amount, rounded to the nearest franc.
 * Used for tips, where rounding up or down by a franc is acceptable.
 */
export function percentOfRwf(amountRwf: number, percent: number): number {
  return Math.round((amountRwf * percent) / 100);
}

/**
 * Sums amounts that share one currency. Throws if currencies differ, because
 * adding different currencies without a conversion basis is a bug.
 */
export function sumMoney(values: Money[], currency: CurrencyCode): Money {
  return values.reduce<Money>((total, value) => {
    if (value.currency !== currency) {
      throw new Error(`Cannot add ${value.currency} to ${currency} without conversion`);
    }
    return { amountMinor: total.amountMinor + value.amountMinor, currency };
  }, { amountMinor: 0, currency });
}
