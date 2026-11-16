"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DemoBadge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DemoNotice } from "@/components/ui/misc";
import { ConvertBackForm } from "@/components/wallet/convert-back-form";
import { TopUpForm } from "@/components/wallet/top-up-form";
import { WalletSummaryCard } from "@/components/wallet/wallet-summary-card";
import { formatDateTime } from "@/lib/dates";
import { formatRate, getRateMilli } from "@/lib/fx";
import { SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import { useDemoStore } from "@/lib/store/demo-store";
import type { ExchangeDirection } from "@/types/exchange";

const DIRECTIONS = [
  { value: "top_up", label: "Add Money" },
  { value: "convert_back", label: "Refund" },
] as const;

/** Wallet & exchange page: balance, top-up, refund (convert back) and sample rates. */
export function WalletView({ initialDirection = "top_up" }: { initialDirection?: ExchangeDirection }) {
  const { wallet, data } = useDemoStore();
  const [direction, setDirection] = useState<ExchangeDirection>(initialDirection);
  const homeCurrency = data.preferences.homeCurrency;

  return (
    <>
      <PageHeader
        title="Wallet & exchange"
        description="Add money from your card with every cost shown up front. When you leave Rwanda, use Refund to convert your remaining balance back to your original currency."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Wallet & exchange" }]}
      />
      <DemoNotice className="mb-6">
        Sample rates and simulated transactions. Confirming adds a demo record in this browser only — no card is charged.
      </DemoNotice>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card as="section" aria-labelledby="exchange-heading" padding="lg">
          <CardHeader
            id="exchange-heading"
            title={direction === "top_up" ? "Add Money" : "Refund"}
            description={
              direction === "top_up"
                ? "Convert your card currency to Rwandan francs"
                : "Convert remaining RWF back to your original currency before leaving Rwanda"
            }
            action={<DemoBadge label="Sample rates" />}
          />
          <SegmentedControl
            label="Exchange direction"
            hideLabel
            name="exchange-direction"
            value={direction}
            options={DIRECTIONS}
            onChange={setDirection}
            className="mb-6"
          />
          {direction === "top_up" ? <TopUpForm /> : <ConvertBackForm key={wallet.balanceRwf} />}
        </Card>

        <div className="space-y-6">
          <WalletSummaryCard wallet={wallet} homeCurrency={homeCurrency} homeRateMilli={getRateMilli(SAMPLE_RATE_BOARD, homeCurrency)} showActions={false} />

          <Card as="section" aria-labelledby="rates-heading">
            <CardHeader id="rates-heading" title="Sample rates" description={`As of ${formatDateTime(SAMPLE_RATE_BOARD.asOf)} (Kigali)`} level="h2" />
            <table className="w-full text-sm">
              <caption className="sr-only">Sample exchange rates to Rwandan francs</caption>
              <thead>
                <tr className="text-left text-ink-subtle">
                  <th scope="col" className="pb-2 font-medium">Currency</th>
                  <th scope="col" className="pb-2 text-right font-medium">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SAMPLE_RATE_BOARD.rates.map((rate) => (
                  <tr key={rate.currency}>
                    <th scope="row" className="py-2.5 text-left font-semibold text-ink">
                      {rate.currency}
                    </th>
                    <td className="tabular py-2.5 text-right text-ink">{formatRate(rate.currency, rate.rwfPerUnitMilli)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="type-caption mt-3 text-ink-subtle">Illustrative only — not live, official (BNR) or guaranteed rates.</p>
          </Card>

          <Card as="section" aria-labelledby="refund-info-heading" className="border-brand/20 bg-brand-soft/40">
            <CardHeader id="refund-info-heading" title="About the Refund" />
            <ul className="space-y-2.5">
              {[
                { icon: "↩", text: "Converts your eligible remaining RWF back to your original currency (e.g. USD) before you leave Rwanda." },
                { icon: "ℹ️", text: "Not a general purchase refund — this is the wallet close-out process." },
                { icon: "💱", text: "The applicable rate, fees and final amount are shown before you confirm." },
                { icon: "⚠️", text: "Subject to provider, regulatory and transaction rules. Sample rates only — not guaranteed." },
              ].map((point) => (
                <li key={point.text} className="flex items-start gap-2.5 type-caption text-ink-muted">
                  <span className="mt-0.5 shrink-0 text-sm" aria-hidden="true">{point.icon}</span>
                  {point.text}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
