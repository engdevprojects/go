"use client";

import { ArrowRight, BookUser, CalendarClock, QrCode, Send, Signal, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DemoBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ExchangeRateCard } from "@/components/wallet/exchange-rate-card";
import { WalletSummaryCard } from "@/components/wallet/wallet-summary-card";
import { EXPIRY_REMINDER_DAYS, EXTENSION_FEE_USD_MINOR } from "@/lib/config/product";
import { formatDate, formatWeekday, greetingFor } from "@/lib/dates";
import { getRateMilli } from "@/lib/fx";
import { formatUsd } from "@/lib/money";
import { SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import { useDemoStore } from "@/lib/store/demo-store";

const QUICK_ACTIONS = [
  { label: "Pay & Tip", href: "/services/pay-tip", icon: QrCode, modal: "pay-tip" as const, description: "Scan or enter a merchant code", bg: "bg-accent-soft", text: "text-accent-strong" },
  { label: "Send Money", href: "/services/mobile-money", icon: Send, modal: "send-money" as const, description: "MTN MoMo & Airtel Money", bg: "bg-brand-soft", text: "text-brand-strong" },
  { label: "Buy Data", href: "/services/esim", icon: Signal, modal: null, description: "Roaming eSIM plans", bg: "bg-info-soft", text: "text-info" },
  { label: "Wallet", href: "/wallet", icon: Wallet, modal: null, description: "Add money or refund", bg: "bg-surface-muted", text: "text-ink-muted" },
] as const;

type ModalType = "pay-tip" | "send-money" | null;

/** The signed-in home: balance, rate, quick actions and travel info. */
export function DashboardView() {
  const { profile, wallet, data, now } = useDemoStore();
  const homeCurrency = data.preferences.homeCurrency;
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={<p className="type-caption text-ink-muted">{formatWeekday(now.toISOString())} · Kigali (demo date)</p>}
        title={`${greetingFor(now)}, ${profile.givenName}`}
        description="Here’s your wallet at a glance. Everything below uses sample data."
        actions={<DemoBadge label="Demo data" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WalletSummaryCard wallet={wallet} homeCurrency={homeCurrency} homeRateMilli={getRateMilli(SAMPLE_RATE_BOARD, homeCurrency)} />
        </div>
        <ExchangeRateCard initialCurrency={homeCurrency} />
      </div>

      <nav aria-label="Quick actions">
        <p className="type-overline mb-3 text-ink-subtle">Quick actions</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <li key={action.href}>
              {action.modal ? (
                <button
                  type="button"
                  onClick={() => setModal(action.modal)}
                  className="focus-ring group flex h-full w-full flex-col items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-card transition-[border-color,box-shadow,translate] duration-[var(--duration-base)] hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-raised"
                >
                  <span className={`flex size-11 items-center justify-center rounded-xl ${action.bg} ${action.text}`} aria-hidden="true">
                    <action.icon className="size-5" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-ink">{action.label}</p>
                    <p className="type-caption text-ink-muted">{action.description}</p>
                  </div>
                </button>
              ) : (
                <Link
                  href={action.href}
                  className="focus-ring group flex h-full flex-col items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-card transition-[border-color,box-shadow,translate] duration-[var(--duration-base)] hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-raised"
                >
                  <span className={`flex size-11 items-center justify-center rounded-xl ${action.bg} ${action.text}`} aria-hidden="true">
                    <action.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{action.label}</p>
                    <p className="type-caption text-ink-muted">{action.description}</p>
                  </div>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <Card as="section" aria-labelledby="travel-heading">
        <CardHeader id="travel-heading" title="Your stay" description="Useful reminders for this trip" />
        <ul className="space-y-4">
          <li className="flex gap-3">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
            <p className="text-sm text-ink-muted">
              <span className="font-semibold text-ink">Wallet ends {formatDate(wallet.expiresAt)}.</span>{" "}
              Reminders on day {EXPIRY_REMINDER_DAYS[0]} and day {EXPIRY_REMINDER_DAYS[1]}; one extension available for {formatUsd(EXTENSION_FEE_USD_MINOR)} (illustrative).
            </p>
          </li>
          <li className="flex gap-3">
            <BookUser className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
            <p className="text-sm text-ink-muted">
              <span className="font-semibold text-ink">Your wallet isn&apos;t your visa.</span>{" "}
              Check your permitted stay with the immigration authorities.
            </p>
          </li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href="/services/immigration" variant="outline" size="sm">
            Stay guide
          </ButtonLink>
          <ButtonLink href="/wallet" variant="outline" size="sm">
            <ArrowRight className="size-4" aria-hidden="true" />
            Wallet &amp; exchange
          </ButtonLink>
        </div>
      </Card>

      {/* Pay & Tip quick-launch modal */}
      <Dialog
        open={modal === "pay-tip"}
        onClose={() => setModal(null)}
        title="Pay & Tip"
        description="Scan a merchant QR or enter their code to pay in francs."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <ButtonLink href="/services/pay-tip" onClick={() => setModal(null)}>
              Open Pay &amp; Tip
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-canvas p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-strong" aria-hidden="true">
              <QrCode className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Scan or enter a merchant code</p>
              <p className="type-caption text-ink-muted">The merchant name is verified before you pay.</p>
            </div>
          </div>
          <ul className="space-y-2">
            {[
              "Review merchant name, amount and tip before confirming",
              "Tips carry no visitor fee — presets at 5%, 10%, 15%",
              "Payments over USD 500 need an extra email code",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 type-caption text-ink-muted">
                <span className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Dialog>

      {/* Send Money quick-launch modal */}
      <Dialog
        open={modal === "send-money"}
        onClose={() => setModal(null)}
        title="Send Money"
        description="Send francs to an MTN MoMo or Airtel Money number."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <ButtonLink href="/services/mobile-money" onClick={() => setModal(null)}>
              Open Send Money
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-canvas p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong" aria-hidden="true">
              <Send className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">MTN MoMo &amp; Airtel Money</p>
              <p className="type-caption text-ink-muted">Recipient&apos;s name is confirmed before you send.</p>
            </div>
          </div>
          <ul className="space-y-2">
            {[
              "Enter the recipient\u2019s Rwandan number",
              "Name lookup confirms who owns the number",
              "Review amount, recipient and balance before confirming",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 type-caption text-ink-muted">
                <span className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Dialog>
    </div>
  );
}
