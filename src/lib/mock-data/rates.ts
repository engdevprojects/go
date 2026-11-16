import type { ExchangeRateBoard } from "@/types/exchange";
import type { ForeignCurrencyCode } from "@/types/money";

/**
 * The single source of sample exchange rates for the whole demo.
 *
 * DEMO DATA: these are fixed illustrative figures, not live, official, or
 * guaranteed rates and not BNR reference rates. The same values are used for
 * historical seed transactions so all derived figures stay consistent.
 */
export const SAMPLE_RATE_BOARD: ExchangeRateBoard = {
  asOf: "2027-04-11T06:00:00.000Z",
  sourceLabel: "Sample rates for demonstration",
  rates: [
    { currency: "USD", rwfPerUnitMilli: 1_370_000, previousRwfPerUnitMilli: 1_373_000 },
    { currency: "EUR", rwfPerUnitMilli: 1_510_000, previousRwfPerUnitMilli: 1_506_500 },
    { currency: "GBP", rwfPerUnitMilli: 1_740_000, previousRwfPerUnitMilli: 1_738_000 },
  ],
};

/** Foreign currencies offered in selectors, in display order. */
export const FOREIGN_CURRENCIES: readonly ForeignCurrencyCode[] = ["USD", "EUR", "GBP"];

/** Type guard for values coming from `<select>` elements and query strings. */
export function isForeignCurrency(value: string): value is ForeignCurrencyCode {
  return (FOREIGN_CURRENCIES as readonly string[]).includes(value);
}
