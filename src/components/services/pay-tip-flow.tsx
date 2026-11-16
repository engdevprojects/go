"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BadgeCheck, CheckCircle2, Keyboard, QrCode, RotateCcw, Store, XCircle } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { QrScanner } from "@/components/services/qr-scanner";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox, describedBy, FormError, FormField, Input } from "@/components/ui/form-controls";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DetailRow } from "@/components/ui/misc";
import { OtpInput } from "@/components/ui/otp-input";
import { useToast } from "@/components/ui/toast";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import { DEMO_OTP_CODE, HIGH_VALUE_PAYMENT_USD_MINOR, TIP_PRESET_PERCENTS } from "@/lib/config/product";
import { formatRwf, formatUsd, parseAmountToMinor } from "@/lib/money";
import { requiresStepUp, resolveTip, type TipChoice } from "@/lib/payments";
import { parseQrPayload, SAMPLE_QR_PAYLOADS } from "@/lib/qr-payload";
import { SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { createPaymentSchema, merchantCodeSchema, type MerchantCodeValues, type PaymentValues } from "@/lib/validation/services";
import type { DemoMerchant } from "@/types/service";
import type { Transaction } from "@/types/transaction";

const PROCESSING_DELAY_MS = 1_200;

/** Tip options; the preset values mirror TIP_PRESET_PERCENTS (5, 10, 15). */
const TIP_OPTIONS: readonly { value: TipChoice; label: string }[] = [
  { value: "none", label: "No tip" },
  { value: "5", label: `${TIP_PRESET_PERCENTS[0]}%` },
  { value: "10", label: `${TIP_PRESET_PERCENTS[1]}%` },
  { value: "15", label: `${TIP_PRESET_PERCENTS[2]}%` },
  { value: "custom", label: "Custom" },
];

interface PaymentDraft {
  merchant: DemoMerchant;
  amountRwf: number;
  tipRwf: number;
  tipPercent: number | null;
}

type Step =
  | { name: "start"; error?: string }
  | { name: "pay"; merchant: DemoMerchant; suggestedAmountRwf: number | null }
  | { name: "review"; draft: PaymentDraft }
  | { name: "done"; payment: Transaction; tip: Transaction | null }
  | { name: "failed"; draft: PaymentDraft; attempt: Transaction };

/**
 * Pay & Tip demo (UR-14 – UR-17). The merchant name is always resolved from
 * the local directory, never taken from QR content. Confirming records
 * simulated transactions in this browser only.
 */
export function PayTipFlow() {
  const [step, setStep] = useState<Step>({ name: "start" });

  return (
    <div aria-live="polite">
      {step.name === "start" ? <StartStep error={step.error} onResolved={(merchant, amount) => setStep({ name: "pay", merchant, suggestedAmountRwf: amount })} onError={(error) => setStep({ name: "start", error })} /> : null}
      {step.name === "pay" ? (
        <PayStep
          merchant={step.merchant}
          suggestedAmountRwf={step.suggestedAmountRwf}
          onBack={() => setStep({ name: "start" })}
          onReview={(draft) => setStep({ name: "review", draft })}
        />
      ) : null}
      {step.name === "review" ? (
        <ReviewStep
          draft={step.draft}
          onBack={() => setStep({ name: "pay", merchant: step.draft.merchant, suggestedAmountRwf: step.draft.amountRwf })}
          onDone={(payment, tip) => setStep({ name: "done", payment, tip })}
          onFailed={(attempt) => setStep({ name: "failed", draft: step.draft, attempt })}
        />
      ) : null}
      {step.name === "done" ? <DoneStep payment={step.payment} tip={step.tip} onAgain={() => setStep({ name: "start" })} /> : null}
      {step.name === "failed" ? (
        <FailedStep attempt={step.attempt} onRetry={() => setStep({ name: "review", draft: step.draft })} onStartOver={() => setStep({ name: "start" })} />
      ) : null}
    </div>
  );
}

/** Step 1: scan, enter a merchant code, or use a test code. */
function StartStep({ error, onResolved, onError }: { error?: string; onResolved: (merchant: DemoMerchant, amount: number | null) => void; onError: (error: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MerchantCodeValues>({ resolver: zodResolver(merchantCodeSchema), defaultValues: { code: "" } });

  function handlePayload(raw: string) {
    const result = parseQrPayload(raw);
    if (result.ok) onResolved(result.merchant, result.suggestedAmountRwf);
    else onError(result.reason);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card as="section" aria-labelledby="scan-heading">
        <CardHeader id="scan-heading" title="Scan a QR code" description="Works in browsers that support camera QR decoding." />
        <QrScanner onResult={handlePayload} />
      </Card>

      <div className="space-y-6">
        {error ? (
          <Alert tone="danger" live="assertive" title="That code can't be paid">
            {error}
          </Alert>
        ) : null}

        <Card as="section" aria-labelledby="manual-heading">
          <CardHeader id="manual-heading" title="Enter a merchant code" description="Printed under the merchant's QR code." />
          <form
            noValidate
            onSubmit={handleSubmit((values) => handlePayload(`rvw-demo:pay?code=${encodeURIComponent(values.code)}`))}
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
          >
            <FormField id="merchant-code" label="Merchant code" error={errors.code?.message} className="flex-1">
              <Input
                id="merchant-code"
                placeholder="EK-100421"
                autoComplete="off"
                autoCapitalize="characters"
                leading={<Keyboard aria-hidden="true" />}
                invalid={Boolean(errors.code)}
                aria-describedby={describedBy("merchant-code", false, errors.code)}
                {...register("code")}
              />
            </FormField>
            <Button type="submit" className="sm:mt-7">
              Look up
            </Button>
          </form>
        </Card>

        <Card as="section" aria-labelledby="test-heading">
          <CardHeader id="test-heading" title="Test codes" description="Simulate scanning a demo QR — useful without a camera." />
          <ul className="space-y-2">
            {SAMPLE_QR_PAYLOADS.map((sample) => (
              <li key={sample.payload}>
                <button
                  type="button"
                  onClick={() => handlePayload(sample.payload)}
                  className="focus-ring flex w-full items-center gap-3 rounded-md border border-border p-3 text-left hover:border-border-strong hover:bg-surface-muted"
                >
                  <QrCode className="size-5 shrink-0 text-brand" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{sample.label}</span>
                    <code className="type-caption block truncate text-ink-subtle">{sample.payload}</code>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/** Step 2: merchant review + amount + tip. */
function PayStep({
  merchant,
  suggestedAmountRwf,
  onBack,
  onReview,
}: {
  merchant: DemoMerchant;
  suggestedAmountRwf: number | null;
  onBack: () => void;
  onReview: (draft: PaymentDraft) => void;
}) {
  const { wallet } = useDemoStore();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<PaymentValues>({
    resolver: zodResolver(createPaymentSchema(wallet.balanceRwf)),
    defaultValues: { amount: suggestedAmountRwf ? String(suggestedAmountRwf) : "", tipChoice: "none", customTip: "" },
  });
  const [amountText, tipChoice, customTip] = useWatch({ control, name: ["amount", "tipChoice", "customTip"] });
  const amountRwf = parseAmountToMinor(amountText ?? "", "RWF") ?? 0;
  const tip = merchant.acceptsTips ? resolveTip(amountRwf, tipChoice, customTip) : { amountRwf: 0, percent: null };

  function onSubmit(values: PaymentValues) {
    const amount = parseAmountToMinor(values.amount, "RWF");
    const resolved = merchant.acceptsTips ? resolveTip(amount ?? 0, values.tipChoice, values.customTip) : { amountRwf: 0, percent: null };
    if (amount === null || resolved === null) {
      setError("customTip", { message: "Enter the tip in whole francs" });
      return;
    }
    if (amount + resolved.amountRwf > wallet.balanceRwf) {
      setError("amount", { message: `With the tip, that's more than your available ${formatRwf(wallet.balanceRwf)}` });
      return;
    }
    onReview({ merchant, amountRwf: amount, tipRwf: resolved.amountRwf, tipPercent: resolved.percent });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <Card as="section" aria-labelledby="merchant-heading">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-4">
          <ArrowLeft aria-hidden="true" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-lg bg-brand-soft text-brand-strong" aria-hidden="true">
            <Store className="size-6" />
          </span>
          <div className="min-w-0">
            <h2 id="merchant-heading" ref={headingRef} tabIndex={-1} className="type-section-title text-ink outline-none">
              {merchant.name}
            </h2>
            <p className="type-caption text-ink-muted">
              {merchant.category} · {merchant.venue}
            </p>
          </div>
        </div>
        <dl className="mt-5 divide-y divide-border">
          <DetailRow label="Merchant code" value={merchant.code} />
          <DetailRow label="Name check" value={<Badge tone="success" icon={<BadgeCheck aria-hidden="true" />}>Found in demo directory</Badge>} />
          <DetailRow label="Tips" value={merchant.acceptsTips ? "Accepted" : "Not accepted"} />
        </dl>
        <p className="type-caption mt-4 text-ink-subtle">
          The merchant name is looked up from the code, not read from the QR — so a tampered code can&apos;t show a fake name.
        </p>
      </Card>

      <Card as="section" aria-labelledby="amount-heading">
        <CardHeader id="amount-heading" title="How much?" description={`Available: ${formatRwf(wallet.balanceRwf)}`} />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormField id="pay-amount" label="Amount" error={errors.amount?.message} hint={suggestedAmountRwf ? "Suggested by the merchant's code — you can change it." : undefined}>
            <Input
              id="pay-amount"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              leading={<span className="text-xs font-semibold">RWF</span>}
              className="pl-12 tabular"
              invalid={Boolean(errors.amount)}
              aria-describedby={describedBy("pay-amount", Boolean(suggestedAmountRwf), errors.amount)}
              {...register("amount")}
            />
          </FormField>

          {merchant.acceptsTips ? (
            <div className="space-y-3">
              <Controller
                control={control}
                name="tipChoice"
                render={({ field }) => <SegmentedControl label="Add a tip" name="tip-choice" value={field.value} options={TIP_OPTIONS} onChange={field.onChange} />}
              />
              {tipChoice === "custom" ? (
                <FormField id="custom-tip" label="Custom tip" error={errors.customTip?.message}>
                  <Input
                    id="custom-tip"
                    inputMode="numeric"
                    placeholder="0"
                    leading={<span className="text-xs font-semibold">RWF</span>}
                    className="pl-12 tabular"
                    invalid={Boolean(errors.customTip)}
                    aria-describedby={describedBy("custom-tip", false, errors.customTip)}
                    {...register("customTip")}
                  />
                </FormField>
              ) : null}
            </div>
          ) : null}

          <dl className="rounded-lg border border-border bg-canvas px-4 py-1">
            <DetailRow label="Payment" value={formatRwf(amountRwf)} />
            {merchant.acceptsTips ? <DetailRow label="Tip" value={tip ? formatRwf(tip.amountRwf) : "—"} /> : null}
            <DetailRow label="Visitor fee" value="None" />
            <DetailRow label="Total" value={formatRwf(amountRwf + (tip?.amountRwf ?? 0))} emphasis />
          </dl>

          <Button type="submit" size="lg" fullWidth>
            Review payment
          </Button>
        </form>
      </Card>
    </div>
  );
}

/** Step 3: confirm, with the extra email-code step for large payments. */
function ReviewStep({
  draft,
  onBack,
  onDone,
  onFailed,
}: {
  draft: PaymentDraft;
  onBack: () => void;
  onDone: (payment: Transaction, tip: Transaction | null) => void;
  onFailed: (attempt: Transaction) => void;
}) {
  const { wallet } = useDemoStore();
  const { recordTransaction } = useDemoActions();
  const toast = useToast();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const [processing, setProcessing] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const total = draft.amountRwf + draft.tipRwf;
  const stepUp = requiresStepUp(total, SAMPLE_RATE_BOARD);

  async function confirm() {
    if (processing) return;
    if (stepUp && code !== DEMO_OTP_CODE) {
      setCodeError(code.length < 6 ? "Enter the 6-digit code" : "That code isn't right");
      return;
    }
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));
    const base = {
      category: draft.merchant.spendingCategory,
      counterparty: { name: draft.merchant.name, kind: "merchant" as const, identifier: draft.merchant.code },
    };
    if (simulateFailure) {
      const attempt = recordTransaction(
        { ...base, type: "payment", status: "failed", title: draft.merchant.name, walletAmountRwf: -draft.amountRwf, note: "Simulated failure. No money left the wallet." },
        { kind: "payment", title: "Payment didn't go through", body: `${formatRwf(draft.amountRwf)} at ${draft.merchant.name} failed (simulated). Nothing was taken.` },
      );
      setProcessing(false);
      onFailed(attempt);
      return;
    }
    const payment = recordTransaction(
      { ...base, type: "payment", status: "completed", title: draft.merchant.name, walletAmountRwf: -draft.amountRwf, note: "Simulated eKash payment. No real money moved." },
      { kind: "payment", title: "Demo payment sent", body: `${formatRwf(draft.amountRwf)} to ${draft.merchant.name} (simulated).` },
    );
    const tip =
      draft.tipRwf > 0
        ? recordTransaction({
            ...base,
            type: "tip",
            status: "completed",
            category: "tips",
            title: `Tip · ${draft.merchant.name}`,
            walletAmountRwf: -draft.tipRwf,
            tip: { percent: draft.tipPercent, amountRwf: draft.tipRwf },
            note: `Tip for ${payment.reference}. Simulated.`,
          })
        : null;
    setProcessing(false);
    toast({ tone: "success", title: "Demo payment complete", description: `Reference ${payment.reference}` });
    onDone(payment, tip);
  }

  return (
    <Card padding="lg" className="mx-auto max-w-xl">
      <Button variant="ghost" size="sm" onClick={onBack} disabled={processing} className="-ml-2 mb-4">
        <ArrowLeft aria-hidden="true" />
        Edit amount
      </Button>
      <h2 ref={headingRef} tabIndex={-1} className="type-section-title text-ink outline-none">
        Confirm payment
      </h2>
      <p className="type-caption mt-1 text-ink-muted">Check the merchant name before you confirm.</p>
      <dl className="mt-5 divide-y divide-border">
        <DetailRow label="To" value={`${draft.merchant.name} · ${draft.merchant.code}`} />
        <DetailRow label="Payment" value={formatRwf(draft.amountRwf)} />
        <DetailRow label="Tip" value={draft.tipRwf > 0 ? `${formatRwf(draft.tipRwf)}${draft.tipPercent ? ` (${draft.tipPercent}%)` : ""}` : "None"} />
        <DetailRow label="Visitor fee" value="None" />
        <DetailRow label="Balance after" value={formatRwf(wallet.balanceRwf - total)} />
        <DetailRow label="Total" value={formatRwf(total)} emphasis />
      </dl>

      {stepUp ? (
        <div className="mt-6 space-y-2 rounded-lg border border-border p-4">
          <p className="text-sm font-semibold text-ink">Extra check for payments over {formatUsd(HIGH_VALUE_PAYMENT_USD_MINOR)}</p>
          <p className="type-caption text-ink-muted">Enter the email code (demo code {DEMO_OTP_CODE}). The app would also ask for your biometrics or PIN.</p>
          <OtpInput label="Email code" value={code} onChange={(value) => { setCode(value); setCodeError(undefined); }} invalid={Boolean(codeError)} describedBy="step-up-error" disabled={processing} />
          <FormError id="step-up-error" message={codeError} />
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <Checkbox
          id="simulate-failure"
          checked={simulateFailure}
          onChange={(event) => setSimulateFailure(event.target.checked)}
          label="Simulate a failed payment"
          description="Demo control to preview the failure and retry experience."
        />
        <Alert tone="warning">Demo only: this records a sample transaction in this browser. No real payment is made.</Alert>
        <Button size="lg" fullWidth onClick={confirm} loading={processing} loadingLabel="Sending demo payment…">
          Pay {formatRwf(total)} (demo)
        </Button>
      </div>
    </Card>
  );
}

/** Simulated failure with retry. No money moved; the attempt is in history. */
function FailedStep({ attempt, onRetry, onStartOver }: { attempt: Transaction; onRetry: () => void; onStartOver: () => void }) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  return (
    <Card padding="lg" className="mx-auto max-w-xl text-center" role="alert">
      <XCircle className="mx-auto size-12 text-danger" aria-hidden="true" />
      <h2 ref={headingRef} tabIndex={-1} className="type-section-title mt-3 text-ink outline-none">
        Payment didn&apos;t go through (simulated)
      </h2>
      <p className="type-body mt-2 text-ink-muted">No money left your wallet. The failed attempt is in your history as {attempt.reference}.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={onRetry}>
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
        <Button variant="outline" onClick={onStartOver}>
          Start over
        </Button>
      </div>
    </Card>
  );
}

/** Step 4: simulated success. */
function DoneStep({ payment, tip, onAgain }: { payment: Transaction; tip: Transaction | null; onAgain: () => void }) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const total = -payment.walletAmountRwf + (tip ? -tip.walletAmountRwf : 0);
  return (
    <Card padding="lg" className="mx-auto max-w-xl text-center" role="status">
      <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden="true" />
      <h2 ref={headingRef} tabIndex={-1} className="type-section-title mt-3 text-ink outline-none">
        Paid {formatRwf(total)} (simulated)
      </h2>
      <p className="type-body mt-2 text-ink-muted">
        To {payment.counterparty?.name}. Reference {payment.reference}
        {tip ? ` · tip ${tip.reference}` : ""}. No real money moved.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href={`/transactions/${payment.id}`}>View receipt</ButtonLink>
        <Button variant="outline" onClick={onAgain}>
          Make another payment
        </Button>
      </div>
    </Card>
  );
}
