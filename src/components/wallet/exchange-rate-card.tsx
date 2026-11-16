"use client";

import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/form-controls";
import { formatDateTime } from "@/lib/dates";
import { foreignToRwf, formatRate } from "@/lib/fx";
import { CURRENCY_NAMES, formatMoney, minorFactor } from "@/lib/money";
import { FOREIGN_CURRENCIES, isForeignCurrency, SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import type { ForeignCurrencyCode } from "@/types/money";

/** Example amounts shown in the quick reference table (major units). */
const REFERENCE_AMOUNTS = [10, 50, 100] as const;

/**
 * Sample-rate preview with a currency selector. Reads the single shared rate
 * board, so it always agrees with the exchange page.
 */
export function ExchangeRateCard({ initialCurrency }: { initialCurrency: ForeignCurrencyCode }) {
  const [currency, setCurrency] = useState<ForeignCurrencyCode>(initialCurrency);
  const sample = SAMPLE_RATE_BOARD.rates.find((rate) => rate.currency === currency);
  if (!sample) return null;

  const delta = sample.rwfPerUnitMilli - sample.previousRwfPerUnitMilli;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendText = delta > 0 ? "Higher than the previous sample" : delta < 0 ? "Lower than the previous sample" : "Unchanged";

  return (
    <Card as="section" aria-labelledby="rate-card-heading" className="flex flex-col">
      <CardHeader id="rate-card-heading" title="Exchange rate" action={<DemoBadge label="Sample" />} />
      <label htmlFor="rate-currency" className="sr-only">
        Currency
      </label>
      <Select
        id="rate-currency"
        value={currency}
        onChange={(event) => {
          if (isForeignCurrency(event.target.value)) setCurrency(event.target.value);
        }}
      >
        {FOREIGN_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code} — {CURRENCY_NAMES[code]}
          </option>
        ))}
      </Select>
      <p className="type-amount mt-4 text-2xl text-ink">{formatRate(currency, sample.rwfPerUnitMilli)}</p>
      <p className="type-caption mt-1 flex items-center gap-1.5 text-ink-muted">
        <TrendIcon className="size-4" aria-hidden="true" />
        {trendText}
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-md bg-surface-muted p-3 text-center">
        {REFERENCE_AMOUNTS.map((amount) => (
          <div key={amount}>
            <dt className="type-caption text-ink-muted">{formatMoney({ amountMinor: amount * minorFactor(currency), currency }, { compact: true })}</dt>
            <dd className="tabular mt-0.5 text-sm font-semibold text-ink">
              {formatMoney({ amountMinor: foreignToRwf(amount * minorFactor(currency), currency, sample.rwfPerUnitMilli), currency: "RWF" })}
            </dd>
          </div>
        ))}
      </dl>
      <p className="type-caption mt-3 text-ink-subtle">
        Sample dated {formatDateTime(SAMPLE_RATE_BOARD.asOf)}. Not live or guaranteed; excludes the 2% top-up fee.
      </p>
      <ButtonLink href="/wallet" variant="secondary" className="mt-4 self-start">
        Get a quote
        <ArrowRight aria-hidden="true" />
      </ButtonLink>
    </Card>
  );
}
