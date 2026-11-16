import { QUOTE_LOCK_MINUTES, REFUND_DEDUCTION_USD_MINOR, TOP_UP_FEE_BASIS_POINTS } from "@/lib/config/product";
import { applyBasisPointsCeil, minorFactor } from "@/lib/money";
import type { ConvertBackQuote, ExchangeRateBoard, TopUpQuote } from "@/types/exchange";
import type { ForeignCurrencyCode } from "@/types/money";

/**
 * Exchange arithmetic. Rates are integers (RWF per unit x 1000) and amounts are
 * integer minor units, so every step is exact integer maths followed by a
 * single, explicit floor. Results are illustrative only — sample rates, not
 * live or guaranteed quotes.
 */

const RATE_SCALE = 1000;

/**
 * Looks up the sample rate for a currency.
 * @throws If the board has no rate for the currency (a data bug, not user error).
 */
export function getRateMilli(board: ExchangeRateBoard, currency: ForeignCurrencyCode): number {
  const sample = board.rates.find((rate) => rate.currency === currency);
  if (!sample) throw new Error(`No sample rate for ${currency}`);
  return sample.rwfPerUnitMilli;
}

/**
 * Converts a foreign minor-unit amount to whole RWF, rounding down.
 * @param amountMinor Foreign amount in minor units.
 * @param currency Foreign currency.
 * @param rateMilli RWF per unit x 1000.
 */
export function foreignToRwf(amountMinor: number, currency: ForeignCurrencyCode, rateMilli: number): number {
  return Math.floor((amountMinor * rateMilli) / (minorFactor(currency) * RATE_SCALE));
}

/**
 * Converts whole RWF to foreign minor units, rounding down.
 * @param amountRwf Whole francs.
 * @param currency Target currency.
 * @param rateMilli RWF per unit x 1000.
 */
export function rwfToForeign(amountRwf: number, currency: ForeignCurrencyCode, rateMilli: number): number {
  return Math.floor((amountRwf * minorFactor(currency) * RATE_SCALE) / rateMilli);
}

/**
 * Expresses any foreign amount in USD cents via the RWF cross rate. Used for
 * tier-limit checks, which the requirements state in USD.
 */
export function toUsdMinor(amountMinor: number, currency: ForeignCurrencyCode, board: ExchangeRateBoard): number {
  if (currency === "USD") return amountMinor;
  const rwf = foreignToRwf(amountMinor, currency, getRateMilli(board, currency));
  return rwfToForeign(rwf, "USD", getRateMilli(board, "USD"));
}

/**
 * Formats a rate for display, e.g. 1370000 → "1 USD = 1,370.00 RWF".
 */
export function formatRate(currency: ForeignCurrencyCode, rateMilli: number): string {
  const value = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    rateMilli / RATE_SCALE,
  );
  return `1 ${currency} = ${value} RWF`;
}

/**
 * Builds a top-up quote (UR-10): the amount in the card currency, the 2% fee
 * charged on top, the total charged, and the RWF the wallet would receive.
 *
 * @param amountMinor Amount to convert, in the card currency's minor units.
 * @param currency Card currency.
 * @param board Shared sample-rate board.
 * @param now Quote creation time (demo clock), used for the 10-minute lock.
 */
export function buildTopUpQuote(
  amountMinor: number,
  currency: ForeignCurrencyCode,
  board: ExchangeRateBoard,
  now: Date,
): TopUpQuote {
  const rateMilli = getRateMilli(board, currency);
  const fee = applyBasisPointsCeil(amountMinor, TOP_UP_FEE_BASIS_POINTS);
  return {
    direction: "top_up",
    amount: { amountMinor, currency },
    fee: { amountMinor: fee, currency },
    totalCharged: { amountMinor: amountMinor + fee, currency },
    receiveRwf: foreignToRwf(amountMinor, currency, rateMilli),
    rateMilli,
    rateAsOf: board.asOf,
    expiresAt: new Date(now.getTime() + QUOTE_LOCK_MINUTES * 60_000).toISOString(),
  };
}

/**
 * Builds a convert-back estimate (UR-22): RWF converted to the card currency
 * minus the USD 3 deduction (expressed in the card currency via cross rate).
 * The net return never goes below zero.
 */
export function buildConvertBackQuote(
  amountRwf: number,
  currency: ForeignCurrencyCode,
  board: ExchangeRateBoard,
  now: Date,
): ConvertBackQuote {
  const rateMilli = getRateMilli(board, currency);
  const gross = rwfToForeign(amountRwf, currency, rateMilli);
  const deductionRwf = foreignToRwf(REFUND_DEDUCTION_USD_MINOR, "USD", getRateMilli(board, "USD"));
  const deduction = currency === "USD" ? REFUND_DEDUCTION_USD_MINOR : rwfToForeign(deductionRwf, currency, rateMilli);
  return {
    direction: "convert_back",
    amountRwf,
    grossReturn: { amountMinor: gross, currency },
    deduction: { amountMinor: deduction, currency },
    netReturn: { amountMinor: Math.max(0, gross - deduction), currency },
    rateMilli,
    rateAsOf: board.asOf,
    expiresAt: new Date(now.getTime() + QUOTE_LOCK_MINUTES * 60_000).toISOString(),
  };
}
