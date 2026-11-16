"use client";

import { Copy, FileQuestion, Flag, Printer, Share2 } from "lucide-react";
import { CurrencyAmount } from "@/components/finance/currency-amount";
import { TransactionIcon, TransactionStatusBadge } from "@/components/finance/transaction-visuals";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { DemoBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { DetailRow } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { copyText, shareOrCopy } from "@/lib/browser/share";
import { formatDateTime } from "@/lib/dates";
import { formatRate } from "@/lib/fx";
import { affectsBalance, CATEGORY_LABELS, headlineAmount, TRANSACTION_TYPE_LABELS } from "@/lib/ledger";
import { formatMoney, formatRwf, sumMoney } from "@/lib/money";
import { useDemoStore } from "@/lib/store/demo-store";
import type { Transaction } from "@/types/transaction";

const STATUS_EXPLANATIONS: Record<Transaction["status"], string | null> = {
  completed: null,
  pending: "This transaction is pending. The amount is reserved from your balance until it settles.",
  failed: "This transaction failed. No money left your wallet.",
  reversed: "This transaction was reversed and the amount returned to your wallet.",
};

/**
 * Describes how a transaction changed the balance, honestly: failed and
 * reversed entries moved nothing, pending debits are only reserved.
 */
function walletEffect(transaction: Transaction, onCard: boolean): string {
  if (onCard) return "None — charged to card";
  if (!affectsBalance(transaction)) return transaction.status === "failed" ? "None — payment failed" : "None — reversed";
  const amount = formatRwf(transaction.walletAmountRwf, true);
  return transaction.status === "pending" ? `${amount} (reserved)` : amount;
}

/** Builds plain-text receipt lines for sharing. Contains no personal data beyond the merchant name. */
function receiptText(transaction: Transaction): string {
  const { money } = headlineAmount(transaction);
  return [
    `${transaction.title} — ${formatMoney(money, { signed: true })}`,
    `Status: ${transaction.status}`,
    `Date: ${formatDateTime(transaction.createdAt)} (Kigali)`,
    `Reference: ${transaction.reference}`,
    "Demo receipt — sample data, not a real transaction.",
  ].join("\n");
}

/**
 * Receipt view for one transaction: headline amount, status explanation,
 * full breakdown, and share / copy / print actions. Printing gives a PDF
 * receipt via the browser (UR-18).
 */
export function TransactionDetail({ id }: { id: string }) {
  const { transactions, hydrated } = useDemoStore();
  const toast = useToast();
  const transaction = transactions.find((candidate) => candidate.id === id);

  if (!transaction) {
    return (
      <>
      <PageHeader title="Transaction not found" breadcrumbs={[{ label: "Transactions", href: "/transactions" }, { label: "Not found" }]} />
      <Card>
        <EmptyState
          headingLevel="h2"
          icon={<FileQuestion />}
          title="Transaction not found"
          description={
            hydrated
              ? "It may have been created in another browser, or the demo was reset when you signed out."
              : "Loading your demo transactions…"
          }
          action={<ButtonLink href="/transactions">Back to transactions</ButtonLink>}
        />
      </Card>
      </>
    );
  }

  const { money, onCard } = headlineAmount(transaction);
  const explanation = STATUS_EXPLANATIONS[transaction.status];
  const totalCharged =
    transaction.sourceAmount && transaction.feeAmount
      ? sumMoney([transaction.sourceAmount, transaction.feeAmount], transaction.sourceAmount.currency)
      : null;

  async function handleShare() {
    if (!transaction) return;
    const outcome = await shareOrCopy({ title: `Receipt ${transaction.reference}`, text: receiptText(transaction) });
    if (outcome === "copied") toast({ tone: "success", title: "Receipt copied", description: "Sharing isn't available here, so we copied it." });
    else if (outcome === "unavailable") toast({ tone: "danger", title: "Couldn't share", description: "Your browser blocked sharing and copying." });
  }

  async function handleCopyReference() {
    if (!transaction) return;
    const outcome = await copyText(transaction.reference);
    toast(
      outcome === "copied"
        ? { tone: "success", title: "Reference copied", description: transaction.reference }
        : { tone: "danger", title: "Couldn't copy", description: "Select and copy the reference instead." },
    );
  }

  return (
    <>
      <PageHeader
        title="Transaction details"
        breadcrumbs={[{ label: "Transactions", href: "/transactions" }, { label: transaction.reference }]}
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" onClick={handleShare}>
              <Share2 aria-hidden="true" />
              Share
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              Print / PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card as="article" aria-labelledby="receipt-title" padding="lg">
          <div className="flex flex-col items-center border-b border-border pb-6 text-center">
            <TransactionIcon transaction={transaction} className="size-14 [&_svg]:size-6" />
            <h2 id="receipt-title" className="type-section-title mt-3 text-ink">
              {transaction.title}
            </h2>
            <CurrencyAmount money={money} signed colorize size="xl" className="mt-2" />
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <TransactionStatusBadge status={transaction.status} />
              <DemoBadge label="Demo receipt" />
            </div>
          </div>

          {explanation ? (
            <Alert tone={transaction.status === "failed" ? "danger" : "info"} className="mt-6">
              {explanation}
            </Alert>
          ) : null}

          <dl className="mt-4 divide-y divide-border">
            <DetailRow
              label="Reference"
              value={
                <span className="inline-flex items-center gap-1">
                  {transaction.reference}
                  <button type="button" onClick={handleCopyReference} className="focus-ring inline-flex size-7 items-center justify-center rounded-sm text-ink-subtle hover:text-ink print:hidden" aria-label="Copy reference">
                    <Copy className="size-3.5" aria-hidden="true" />
                  </button>
                </span>
              }
            />
            <DetailRow label="Date and time" value={`${formatDateTime(transaction.createdAt)} (Kigali)`} />
            <DetailRow label="Type" value={TRANSACTION_TYPE_LABELS[transaction.type]} />
            {transaction.category ? <DetailRow label="Category" value={CATEGORY_LABELS[transaction.category]} /> : null}
            {transaction.counterparty ? (
              <DetailRow
                label={transaction.counterparty.kind === "card" ? "Card" : transaction.counterparty.kind === "person" ? "Recipient" : "Merchant"}
                value={
                  <span className="block">
                    {transaction.counterparty.name}
                    {transaction.counterparty.identifier ? (
                      <span className="type-caption block text-ink-muted">{transaction.counterparty.identifier}</span>
                    ) : null}
                  </span>
                }
              />
            ) : null}
            {transaction.sourceAmount ? <DetailRow label="Card amount" value={formatMoney(transaction.sourceAmount)} /> : null}
            {transaction.feeAmount ? <DetailRow label="Card fee" value={formatMoney(transaction.feeAmount)} /> : null}
            {totalCharged ? <DetailRow label="Total charged to card" value={formatMoney(totalCharged)} /> : null}
            {transaction.fxRateMilli && transaction.sourceAmount && transaction.sourceAmount.currency !== "RWF" ? (
              <DetailRow label="Sample rate" value={formatRate(transaction.sourceAmount.currency, transaction.fxRateMilli)} />
            ) : null}
            {transaction.tip ? (
              <DetailRow label="Tip" value={`${formatRwf(transaction.tip.amountRwf)}${transaction.tip.percent ? ` (${transaction.tip.percent}%)` : " (custom)"}`} />
            ) : null}
            <DetailRow
              label="Wallet effect"
              value={walletEffect(transaction, onCard)}
              emphasis
            />
          </dl>
          {transaction.note ? <p className="type-caption mt-4 text-ink-muted">{transaction.note}</p> : null}
        </Card>

        <div className="space-y-6 print:hidden">
          <Card as="section" aria-labelledby="help-heading">
            <CardHeader id="help-heading" title="Something wrong?" description="Get help with this transaction" />
            <p className="type-body text-ink-muted">
              If the amount, merchant or status looks wrong, report it with the reference so support can find it.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href={`/account/report-problem?ref=${encodeURIComponent(transaction.reference)}`} variant="secondary">
                <Flag aria-hidden="true" />
                Report a problem
              </ButtonLink>
              <ButtonLink href="/services/refunds" variant="outline">
                Refund guide
              </ButtonLink>
            </div>
          </Card>
          <Alert tone="warning" title="About this receipt">
            This is a demo receipt with sample data. It is not an EBM tax receipt and is not proof of any real payment.
          </Alert>
        </div>
      </div>
    </>
  );
}
