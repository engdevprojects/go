"use client";

import { Ban, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-logo";
import { TransactionRow } from "@/components/finance/transaction-row";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { formatDate } from "@/lib/dates";
import { useDemoStore } from "@/lib/store/demo-store";
import { PAYMENT_BRAND_LABELS } from "@/lib/payment-methods";

/**
 * Cards page: the visitor's linked top-up methods and their activity, plus an
 * honest "not available" state for a visitor card, which isn't in the pilot.
 */
export function CardsOverview() {
  const { data, transactions } = useDemoStore();
  const cardActivity = transactions.filter((transaction) => transaction.counterparty?.kind === "card").slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card as="section" aria-labelledby="visitor-card-heading">
          <CardHeader id="visitor-card-heading" title="Visitor card" action={<Badge tone="neutral" icon={<Ban aria-hidden="true" />}>Not available</Badge>} />
          <div
            aria-hidden="true"
            className="relative flex aspect-[1.586] max-w-sm flex-col justify-between overflow-hidden rounded-xl bg-surface-muted p-5 text-ink-subtle ring-1 ring-border"
          >
            <div className="flex items-center justify-between">
              <BrandMark className="opacity-50 grayscale" />
              <span className="text-xs font-semibold tracking-widest uppercase">Not issued</span>
            </div>
            <p className="font-mono text-lg tracking-[0.2em]">•••• •••• •••• ••••</p>
            <p className="text-xs">Illustration only</p>
          </div>
          <p className="type-body mt-5 text-ink-muted">
            There&apos;s no physical or virtual visitor card in the pilot. You pay with eKash QR, phone number or merchant code instead. A card would
            need a separate card programme, which hasn&apos;t been arranged.
          </p>
        </Card>

        <Card as="section" aria-labelledby="linked-heading">
          <CardHeader
            id="linked-heading"
            title="Linked top-up methods"
            description="Fictional, masked demo methods"
            action={
              <ButtonLink href="/account/payment-methods" variant="outline" size="sm">
                Manage
              </ButtonLink>
            }
          />
          {data.paymentMethods.length === 0 ? (
            <EmptyState icon={<CreditCard />} title="No saved methods" description="Add a demo method to try a top-up." action={<ButtonLink href="/account/payment-methods">Add a method</ButtonLink>} />
          ) : (
            <ul className="space-y-2">
              {data.paymentMethods.map((method) => (
                <li key={method.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <CreditCard className="size-5 text-brand" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{method.nickname}</p>
                    <p className="type-caption text-ink-muted">
                      {PAYMENT_BRAND_LABELS[method.brand]} •••• {method.last4} · added {formatDate(method.addedAt)}
                    </p>
                  </div>
                  {method.isDefault ? <Badge tone="brand">Default</Badge> : null}
                </li>
              ))}
            </ul>
          )}
          <ul className="type-caption mt-5 space-y-2 text-ink-muted">
            <li className="flex gap-2">
              <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
              Planned: 3-D Secure on every card top-up.
            </li>
            <li className="flex gap-2">
              <Lock className="size-4 shrink-0 text-success" aria-hidden="true" />
              Planned: card details handled by the acquirer&apos;s hosted fields, never stored by the wallet.
            </li>
          </ul>
        </Card>
      </div>

      <Card as="section" aria-labelledby="card-activity-heading">
        <CardHeader id="card-activity-heading" title="Card activity" description="Top-ups and fees charged to your cards" />
        {cardActivity.length === 0 ? (
          <EmptyState icon={<CreditCard />} title="No card activity" description="Top-ups and card fees will appear here." />
        ) : (
          <div className="divide-y divide-border">
            {cardActivity.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} showDate={formatDate(transaction.createdAt)} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
