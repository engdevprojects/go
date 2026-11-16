import type { ForeignCurrencyCode, ForeignMoney } from "./money";

/** One sample rate: RWF per 1 unit of `currency`, scaled by 1000 to stay integer. */
export interface ExchangeRateSample {
  currency: ForeignCurrencyCode;
  rwfPerUnitMilli: number;
  /** The previous sample, used only to show a direction indicator. */
  previousRwfPerUnitMilli: number;
}

/** The shared board of sample rates used by every component. */
export interface ExchangeRateBoard {
  /** ISO timestamp the sample was "taken" — fixed demo value, not live. */
  asOf: string;
  sourceLabel: string;
  rates: ExchangeRateSample[];
}

/** Direction of an exchange estimate. */
export type ExchangeDirection = "top_up" | "convert_back";

/** Top-up quote: card currency in, RWF out (UR-10). */
export interface TopUpQuote {
  direction: "top_up";
  amount: ForeignMoney;
  fee: ForeignMoney;
  totalCharged: ForeignMoney;
  receiveRwf: number;
  rateMilli: number;
  rateAsOf: string;
  /** Quote lock expiry (10 minutes, UR-10). */
  expiresAt: string;
}

/** Convert-back estimate: RWF balance out, card currency back, minus the refund deduction (UR-22). */
export interface ConvertBackQuote {
  direction: "convert_back";
  amountRwf: number;
  grossReturn: ForeignMoney;
  deduction: ForeignMoney;
  netReturn: ForeignMoney;
  rateMilli: number;
  rateAsOf: string;
  expiresAt: string;
}

export type ExchangeQuote = TopUpQuote | ConvertBackQuote;
