"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock, CreditCard, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, FormField, Input, Select } from "@/components/ui/form-controls";
import { DetailRow } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { TopUpQuoteSummary } from "@/components/wallet/quote-summary";
import { formatCountdown, secondsLeft, useRealNow } from "@/hooks/use-real-now";
import { QUOTE_LOCK_MINUTES, TIER_LIMITS, TOP_UP_BALANCE_THRESHOLD_USD_MINOR } from "@/lib/config/product";
import { demoNowForEvent, readRealClock } from "@/lib/dates";
import { buildTopUpQuote, getRateMilli, rwfToForeign } from "@/lib/fx";
import { CURRENCY_NAMES, formatRwf, formatUsd, parseAmountToMinor } from "@/lib/money";
import { FOREIGN_CURRENCIES, SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import { PAYMENT_BRAND_LABELS } from "@/lib/payment-methods";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { createTopUpSchema, type TopUpValues } from "@/lib/validation/money";
import type { TopUpQuote } from "@/types/exchange";
import type { Transaction } from "@/types/transaction";

const PRESETS = ["50", "100", "200"] as const;
const PROCESSING_DELAY_MS = 1_200;

type ReviewState =
  | { step: "review"; quote: TopUpQuote; lockedAtMs: number }
  | { step: "processing"; quote: TopUpQuote; lockedAtMs: number }
  | { step: "done"; transaction: Transaction };

/**
 * Card top-up quote form (UR-09 – UR-13): live breakdown as you type, a
 * review dialog with a 10-minute rate lock, and a simulated confirmation that
 * adds a clearly-labelled demo transaction to the ledger.
 */
export function TopUpForm() {
  const toast = useToast();
  const nowMs = useRealNow();
  const { wallet, data } = useDemoStore();
  const { recordTransaction } = useDemoActions();
  const [review, setReview] = useState<ReviewState | null>(null);
  const [methodId, setMethodId] = useState<string>(() => data.paymentMethods.find((method) => method.isDefault)?.id ?? "");

  const schema = useMemo(() => createTopUpSchema(wallet.tier, SAMPLE_RATE_BOARD), [wallet.tier]);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<TopUpValues>({
    resolver: zodResolver(schema),
    defaultValues: { currency: data.preferences.homeCurrency, amount: "" },
  });
  const [currency, amount] = useWatch({ control, name: ["currency", "amount"] });

  const amountMinor = parseAmountToMinor(amount ?? "", currency);
  const preview = amountMinor && amountMinor > 0 ? buildTopUpQuote(amountMinor, currency, SAMPLE_RATE_BOARD, new Date(0)) : null;

  const balanceUsdMinor = rwfToForeign(wallet.balanceRwf, "USD", getRateMilli(SAMPLE_RATE_BOARD, "USD"));
  const blockedByThreshold = wallet.tier !== "standard" && balanceUsdMinor >= TOP_UP_BALANCE_THRESHOLD_USD_MINOR;
  const methods = data.paymentMethods;
  const selectedMethod = methods.find((method) => method.id === methodId) ?? methods.find((method) => method.isDefault) ?? methods[0];

  function onSubmit(values: TopUpValues) {
    const minor = parseAmountToMinor(values.amount, values.currency);
    if (minor === null) return;
    const quote = buildTopUpQuote(minor, values.currency, SAMPLE_RATE_BOARD, demoNowForEvent(data.session?.startedAtMs ?? null));
    setReview({ step: "review", quote, lockedAtMs: readRealClock() });
  }

  const lockSeconds = review && review.step !== "done" ? secondsLeft(review.lockedAtMs + QUOTE_LOCK_MINUTES * 60_000, nowMs) : 0;
  const quoteExpired = review !== null && review.step === "review" && nowMs !== 0 && lockSeconds === 0;

  async function confirm() {
    if (!review || review.step !== "review" || !selectedMethod) return;
    const { quote } = review;
    setReview({ ...review, step: "processing" });
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));
    const transaction = recordTransaction(
      {
        type: "top_up",
        status: "completed",
        title: `Top-up from ${PAYMENT_BRAND_LABELS[selectedMethod.brand]}`,
        category: null,
        counterparty: { name: PAYMENT_BRAND_LABELS[selectedMethod.brand], kind: "card", identifier: `•••• ${selectedMethod.last4}` },
        walletAmountRwf: quote.receiveRwf,
        sourceAmount: quote.amount,
        feeAmount: quote.fee,
        fxRateMilli: quote.rateMilli,
        note: "Simulated demo top-up. No card was charged.",
      },
      { kind: "top_up", title: "Demo top-up added", body: `${formatRwf(quote.receiveRwf)} added (simulated).` },
    );
    setReview({ step: "done", transaction });
    toast({ tone: "success", title: "Demo top-up added", description: `${formatRwf(quote.receiveRwf)} · no card was charged` });
  }

  function closeReview() {
    if (review?.step === "processing") return;
    setReview(null);
  }

  function refreshQuote() {
    if (!review || review.step === "done") return;
    const { amount: money } = review.quote;
    const quote = buildTopUpQuote(money.amountMinor, money.currency, SAMPLE_RATE_BOARD, demoNowForEvent(data.session?.startedAtMs ?? null));
    setReview({ step: "review", quote, lockedAtMs: readRealClock() });
  }

  if (blockedByThreshold) {
    return (
      <Alert tone="info" title="Top-ups are paused while your balance is high">
        {TIER_LIMITS[wallet.tier].label} wallets can top up again when the balance is below {formatUsd(TOP_UP_BALANCE_THRESHOLD_USD_MINOR)}.
      </Alert>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
          <FormField id="top-up-currency" label="Card currency">
            <Select id="top-up-currency" {...register("currency")}>
              {FOREIGN_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code} · {CURRENCY_NAMES[code]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            id="top-up-amount"
            label="Amount to convert"
            error={errors.amount?.message}
            hint={`Up to ${formatUsd(TIER_LIMITS[wallet.tier].perConversionUsdMinor)} per conversion on the ${TIER_LIMITS[wallet.tier].label} tier.`}
          >
            <Input
              id="top-up-amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              leading={<span className="text-xs font-semibold">{currency}</span>}
              invalid={Boolean(errors.amount)}
              aria-describedby={describedBy("top-up-amount", true, errors.amount)}
              className="pl-12 tabular"
              {...register("amount")}
            />
          </FormField>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick amounts">
          {PRESETS.map((preset) => (
            <Button key={preset} variant="outline" size="sm" onClick={() => setValue("amount", preset, { shouldValidate: true })}>
              {currency} {preset}
            </Button>
          ))}
        </div>

        <FormField id="top-up-method" label="Pay with" hint="Saved demo methods only. No card details are collected.">
          {methods.length === 0 ? (
            <Alert tone="warning" title="No demo payment method">
              <Link href="/account/payment-methods" className="font-semibold text-brand-strong underline">
                Add a demo method
              </Link>{" "}
              to try a top-up.
            </Alert>
          ) : (
            <Select id="top-up-method" value={selectedMethod?.id ?? ""} onChange={(event) => setMethodId(event.target.value)}>
              {methods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.nickname} · {PAYMENT_BRAND_LABELS[method.brand]} •••• {method.last4}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <div aria-live="polite" className="rounded-lg border border-border bg-canvas p-4 sm:p-5">
          <h3 className="type-card-title mb-1 text-ink">Breakdown</h3>
          {preview ? (
            <TopUpQuoteSummary quote={preview} />
          ) : (
            <p className="type-caption py-3 text-ink-muted">Enter an amount to see the fee, total charged and the francs you&apos;d receive.</p>
          )}
        </div>

        <Button type="submit" size="lg" fullWidth disabled={methods.length === 0}>
          <CreditCard aria-hidden="true" />
          Review top-up
        </Button>
      </form>

      <Dialog
        open={review !== null}
        onClose={closeReview}
        dismissible={review?.step !== "processing"}
        title={review?.step === "done" ? "Demo top-up complete" : "Review your top-up"}
        description={review?.step === "done" ? "Simulated — no card was charged." : "Check every line before you confirm."}
        footer={
          review?.step === "done" ? (
            <>
              <ButtonLink href={`/transactions/${review.transaction.id}`} variant="outline">
                View receipt
              </ButtonLink>
              <Button onClick={() => setReview(null)}>Done</Button>
            </>
          ) : review ? (
            <>
              <Button variant="outline" onClick={closeReview} disabled={review.step === "processing"}>
                Cancel
              </Button>
              {quoteExpired ? (
                <Button onClick={refreshQuote}>
                  <RefreshCw aria-hidden="true" />
                  Get a new quote
                </Button>
              ) : (
                <Button onClick={confirm} loading={review.step === "processing"} loadingLabel="Processing demo top-up…">
                  Confirm demo top-up
                </Button>
              )}
            </>
          ) : null
        }
      >
        {review && review.step !== "done" ? (
          <div className="space-y-4">
            <TopUpQuoteSummary quote={review.quote} />
            {selectedMethod ? (
              <dl>
                <DetailRow label="Card" value={`${PAYMENT_BRAND_LABELS[selectedMethod.brand]} •••• ${selectedMethod.last4}`} />
              </dl>
            ) : null}
            {quoteExpired ? (
              <Alert tone="warning" live="polite" title="This quote has expired">
                Rates are held for {QUOTE_LOCK_MINUTES} minutes. Get a new quote to continue.
              </Alert>
            ) : (
              <p className="type-caption flex items-center gap-2 text-ink-muted">
                <Clock className="size-4" aria-hidden="true" />
                Rate held for <span className="tabular font-semibold text-ink">{formatCountdown(lockSeconds)}</span>
              </p>
            )}
            <Alert tone="warning">Demo only: confirming adds a sample transaction to this browser. No card is charged and no money moves.</Alert>
          </div>
        ) : null}
        {review?.step === "done" ? (
          <div className="flex flex-col items-center py-4 text-center" role="status">
            <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
            <p className="type-section-title mt-3 text-ink">{formatRwf(review.transaction.walletAmountRwf)} added (demo)</p>
            <p className="type-caption mt-1 text-ink-muted">Reference {review.transaction.reference}</p>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
