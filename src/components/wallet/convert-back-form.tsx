"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { describedBy, FormField, Input, Select } from "@/components/ui/form-controls";
import { ConvertBackSummary } from "@/components/wallet/quote-summary";
import { buildConvertBackQuote } from "@/lib/fx";
import { CURRENCY_NAMES, parseAmountToMinor } from "@/lib/money";
import { FOREIGN_CURRENCIES, SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import { useDemoStore } from "@/lib/store/demo-store";
import { createConvertBackSchema, MIN_PAYMENT_RWF, type ConvertBackValues } from "@/lib/validation/money";

/**
 * Convert-back estimate (UR-22). Estimate only: in the service the balance is
 * converted back when the wallet closes or reaches day 30, so there is no
 * "confirm" action here.
 */
export function ConvertBackForm() {
  const { wallet, data } = useDemoStore();
  const schema = useMemo(() => createConvertBackSchema(wallet.balanceRwf), [wallet.balanceRwf]);
  const {
    register,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<ConvertBackValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { currency: data.preferences.homeCurrency, amount: "" },
  });
  const [currency, amount] = useWatch({ control, name: ["currency", "amount"] });
  const rwf = parseAmountToMinor(amount ?? "", "RWF");
  const valid = rwf !== null && rwf >= MIN_PAYMENT_RWF && rwf <= wallet.balanceRwf;
  const estimate = valid ? buildConvertBackQuote(rwf, currency, SAMPLE_RATE_BOARD, new Date(0)) : null;

  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_10rem]">
        <FormField id="convert-amount" label="Francs to convert back" error={errors.amount?.message} hint="Whole francs, up to your available balance.">
          <Input
            id="convert-amount"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            leading={<span className="text-xs font-semibold">RWF</span>}
            invalid={Boolean(errors.amount)}
            aria-describedby={describedBy("convert-amount", true, errors.amount)}
            className="pl-12 tabular"
            trailing={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue("amount", String(wallet.balanceRwf));
                  void trigger("amount");
                }}
              >
                Max
              </Button>
            }
            {...register("amount")}
          />
        </FormField>
        <FormField id="convert-currency" label="Back to">
          <Select id="convert-currency" {...register("currency")}>
            {FOREIGN_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code} · {CURRENCY_NAMES[code]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div aria-live="polite" className="rounded-lg border border-border bg-canvas p-4 sm:p-5">
        <h3 className="type-card-title mb-1 text-ink">Estimate</h3>
        {estimate ? (
          <ConvertBackSummary quote={estimate} />
        ) : (
          <p className="type-caption py-3 text-ink-muted">Enter an amount to estimate what would return to your card.</p>
        )}
      </div>

      <Alert tone="info" title="Estimate only">
        In the service, your balance is converted back when you close the wallet or on day 30 — not on request. Use the{" "}
        <Link href="/wallet" className="font-semibold text-brand-strong underline">
          Refund tab
        </Link>{" "}
        on the Wallet page to estimate what returns to your card.
      </Alert>
    </form>
  );
}
