"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BadgeCheck, CheckCircle2, Inbox, Phone, Send } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { TransactionRow } from "@/components/finance/transaction-row";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { describedBy, FormField, Input } from "@/components/ui/form-controls";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DetailRow } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { formatRwf, parseAmountToMinor } from "@/lib/money";
import { DEMO_RECIPIENTS, MOBILE_MONEY_PROVIDERS } from "@/lib/mock-data/directory";
import { maskRwandanPhone } from "@/lib/payments";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { createMobileMoneySchema, normaliseRwandanPhone, type MobileMoneyValues } from "@/lib/validation/services";
import type { DemoRecipient, MobileMoneyProvider } from "@/types/service";
import type { Transaction } from "@/types/transaction";

const LOOKUP_DELAY_MS = 800;
const SEND_DELAY_MS = 1_200;

type Mode = "send" | "receive";

type SendStep =
  | { name: "form"; lookupError?: string }
  | { name: "looking-up"; values: MobileMoneyValues }
  | { name: "review"; values: MobileMoneyValues; recipient: DemoRecipient; provider: MobileMoneyProvider }
  | { name: "sending"; values: MobileMoneyValues; recipient: DemoRecipient; provider: MobileMoneyProvider }
  | { name: "done"; transaction: Transaction };

/**
 * Mobile Money demo (UR-15, UR-28): send to an MTN MoMo or Airtel Money
 * number. The recipient's name must be found by lookup before anything can be
 * sent; unknown numbers stop the flow. Receiving isn't part of the pilot.
 */
export function MobileMoneyFlow() {
  const [mode, setMode] = useState<Mode>("send");
  const { transactions } = useDemoStore();
  const transfers = useMemo(() => transactions.filter((transaction) => transaction.type === "mobile_money").slice(0, 5), [transactions]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Card as="section" aria-labelledby="momo-heading" padding="lg">
        <CardHeader id="momo-heading" title="Mobile money" description="MTN MoMo and Airtel Money numbers in Rwanda" />
        <SegmentedControl
          label="Action"
          hideLabel
          name="momo-mode"
          value={mode}
          options={[
            { value: "send", label: "Send" },
            { value: "receive", label: "Receive" },
          ]}
          onChange={setMode}
          className="mb-6"
        />
        {mode === "send" ? (
          <SendForm />
        ) : (
          <EmptyState
            icon={<Inbox />}
            title="Receiving isn't part of the pilot"
            description="Your wallet is loaded from your card only. People can't send money into a visitor wallet, so there's no receive flow to demo."
            action={<ButtonLink href="/wallet" variant="outline">Top up from a card</ButtonLink>}
          />
        )}
      </Card>

      <div className="space-y-6">
        <Card as="section" aria-labelledby="providers-heading">
          <CardHeader id="providers-heading" title="Supported networks" />
          <ul className="space-y-3">
            {MOBILE_MONEY_PROVIDERS.map((provider) => (
              <li key={provider.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-accent-soft text-accent-strong" aria-hidden="true">
                  <Phone className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{provider.name}</p>
                  <p className="type-caption text-ink-muted">Numbers starting 0{provider.prefixes.join(" or 0")}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="type-caption mt-4 text-ink-subtle">
            Transfers would go through eKash into the recipient&apos;s existing account. Network names are used for identification only — no
            provider integration exists in this demo.
          </p>
        </Card>

        <Card as="section" aria-labelledby="test-numbers-heading">
          <CardHeader id="test-numbers-heading" title="Demo numbers" description="Only these numbers pass the name lookup." />
          <ul className="type-caption space-y-1.5 text-ink-muted">
            {DEMO_RECIPIENTS.map((recipient) => (
              <li key={recipient.phone} className="flex justify-between gap-2">
                <code className="text-ink">0{recipient.phone}</code>
                <span>{recipient.displayName}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card as="section" aria-labelledby="transfers-heading">
          <CardHeader id="transfers-heading" title="Recent transfers" />
          {transfers.length === 0 ? (
            <EmptyState icon={<Send />} title="No transfers yet" description="Money you send will appear here." />
          ) : (
            <div className="divide-y divide-border">
              {transfers.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} showDate={formatDate(transaction.createdAt)} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/** Step heading that takes focus when its step appears (see useFocusOnMount). */
function StepHeading({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useFocusOnMount<HTMLHeadingElement>();
  return (
    <h3 ref={ref} tabIndex={-1} className={cn("type-card-title text-ink outline-none", className)}>
      {children}
    </h3>
  );
}

/** Send flow: details → name lookup → review → simulated send. */
function SendForm() {
  const { wallet } = useDemoStore();
  const { recordTransaction } = useDemoActions();
  const toast = useToast();
  const [step, setStep] = useState<SendStep>({ name: "form" });
  const schema = useMemo(() => createMobileMoneySchema(wallet.balanceRwf), [wallet.balanceRwf]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MobileMoneyValues>({ resolver: zodResolver(schema), defaultValues: { phone: "", amount: "", note: "" } });

  async function lookUp(values: MobileMoneyValues) {
    setStep({ name: "looking-up", values });
    await new Promise((resolve) => setTimeout(resolve, LOOKUP_DELAY_MS));
    const phone = normaliseRwandanPhone(values.phone);
    const recipient = DEMO_RECIPIENTS.find((candidate) => candidate.phone === phone);
    const provider = MOBILE_MONEY_PROVIDERS.find((candidate) => candidate.prefixes.includes(phone.slice(0, 2)));
    if (!recipient || !provider) {
      setStep({ name: "form", lookupError: "We couldn't confirm who owns this number, so nothing can be sent. Check the number or try a demo number." });
      return;
    }
    setStep({ name: "review", values, recipient, provider });
  }

  async function send() {
    if (step.name !== "review") return;
    const { values, recipient, provider } = step;
    setStep({ ...step, name: "sending" });
    await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));
    const amount = parseAmountToMinor(values.amount, "RWF") ?? 0;
    const transaction = recordTransaction(
      {
        type: "mobile_money",
        status: "completed",
        title: `Sent to ${recipient.displayName}`,
        category: "transfers",
        counterparty: { name: recipient.displayName, kind: "person", identifier: `${provider.name} · ${maskRwandanPhone(recipient.phone)}` },
        walletAmountRwf: -amount,
        note: values.note ? `Note: ${values.note}. Simulated transfer.` : "Simulated transfer. No real money moved.",
      },
      { kind: "payment", title: "Demo transfer sent", body: `${formatRwf(amount)} to ${recipient.displayName} (simulated).` },
    );
    toast({ tone: "success", title: "Demo transfer sent", description: transaction.reference });
    reset();
    setStep({ name: "done", transaction });
  }

  if (step.name === "review" || step.name === "sending") {
    const amount = parseAmountToMinor(step.values.amount, "RWF") ?? 0;
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={() => setStep({ name: "form" })} disabled={step.name === "sending"} className="-ml-2">
          <ArrowLeft aria-hidden="true" />
          Edit details
        </Button>
        <StepHeading>Check the recipient before you send</StepHeading>
        <dl className="divide-y divide-border">
          <DetailRow label="Recipient" value={<Badge tone="success" icon={<BadgeCheck aria-hidden="true" />}>{step.recipient.displayName}</Badge>} />
          <DetailRow label="Number" value={maskRwandanPhone(step.recipient.phone)} />
          <DetailRow label="Network" value={step.provider.name} />
          {step.values.note ? <DetailRow label="Note" value={step.values.note} /> : null}
          <DetailRow label="Visitor fee" value="None" />
          <DetailRow label="Balance after" value={formatRwf(wallet.balanceRwf - amount)} />
          <DetailRow label="You send" value={formatRwf(amount)} emphasis />
        </dl>
        <Alert tone="warning">Demo only: nothing is sent to a real phone. A sample transaction is added in this browser.</Alert>
        <Button size="lg" fullWidth onClick={send} loading={step.name === "sending"} loadingLabel="Sending (demo)…">
          Send {formatRwf(amount)} (demo)
        </Button>
      </div>
    );
  }

  if (step.name === "done") {
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status">
        <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
        <StepHeading className="mt-3">{formatRwf(-step.transaction.walletAmountRwf)} sent (simulated)</StepHeading>
        <p className="type-caption mt-1 text-ink-muted">Reference {step.transaction.reference}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <ButtonLink href={`/transactions/${step.transaction.id}`} variant="outline">
            View receipt
          </ButtonLink>
          <Button onClick={() => setStep({ name: "form" })}>Send again</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(lookUp)} noValidate className="space-y-5">
      {step.name === "form" && step.lookupError ? (
        <Alert tone="danger" live="assertive" title="Name lookup failed">
          {step.lookupError}
        </Alert>
      ) : null}
      <FormField id="momo-phone" label="Recipient's mobile number" error={errors.phone?.message} hint="Rwandan MTN or Airtel number, e.g. 078 812 4512">
        <Input
          id="momo-phone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="078 000 0000"
          leading={<Phone aria-hidden="true" />}
          invalid={Boolean(errors.phone)}
          aria-describedby={describedBy("momo-phone", true, errors.phone)}
          {...register("phone")}
        />
      </FormField>
      <FormField id="momo-amount" label="Amount" error={errors.amount?.message} hint={`Available: ${formatRwf(wallet.balanceRwf)}`}>
        <Input
          id="momo-amount"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          leading={<span className="text-xs font-semibold">RWF</span>}
          className="pl-12 tabular"
          invalid={Boolean(errors.amount)}
          aria-describedby={describedBy("momo-amount", true, errors.amount)}
          {...register("amount")}
        />
      </FormField>
      <FormField id="momo-note" label="Note" optional error={errors.note?.message}>
        <Input id="momo-note" autoComplete="off" maxLength={80} invalid={Boolean(errors.note)} aria-describedby={describedBy("momo-note", false, errors.note)} {...register("note")} />
      </FormField>
      <Button type="submit" size="lg" fullWidth loading={step.name === "looking-up"} loadingLabel="Looking up the name…">
        Continue
      </Button>
    </form>
  );
}
