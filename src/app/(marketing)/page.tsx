import {
  ArrowRight,
  BadgeCheck,
  Clock,
  CreditCard,
  FlaskConical,
  HardDrive,
  Lock,
  MailCheck,
  QrCode,
  Receipt,
  ShieldCheck,
  Signal,
  Smartphone,
  Undo2,
  TrendingUp,
  Globe,
  Wifi,
  MapPin,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ServiceCard } from "@/components/finance/service-card";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DetailRow } from "@/components/ui/misc";
import {
  ACTIVATION_FEE_USD_MINOR,
  QUOTE_LOCK_MINUTES,
  REFUND_DEDUCTION_USD_MINOR,
  WALLET_PERIOD_DAYS,
} from "@/lib/config/product";
import { formatDateTime } from "@/lib/dates";
import { buildTopUpQuote, formatRate } from "@/lib/fx";
import { formatMoney, formatUsd } from "@/lib/money";
import { HELP_CATEGORIES } from "@/lib/mock-data/guides";
import { SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import { SERVICES } from "@/lib/mock-data/services";

export const metadata: Metadata = {
  title: { absolute: "GO — a 30-day wallet for visitors to Rwanda (demo)" },
  description: "Top up from your card, see the rate and fee up front, pay and tip with eKash QR, and get roaming data. Demo with sample data.",
};

const STEPS = [
  { icon: MailCheck, title: "Sign up with email", body: "No local SIM or phone number needed. Confirm your email with a 6-digit code." },
  { icon: BadgeCheck, title: "Verify your identity", body: `A one-off ${formatUsd(ACTIVATION_FEE_USD_MINOR)} activation opens a ${WALLET_PERIOD_DAYS}-day wallet. Passport and liveness checks set your tier.` },
  { icon: CreditCard, title: "Top up from your card", body: "See the amount in your currency, the rate, the 2% fee and the francs you'll receive — before you pay." },
  { icon: Undo2, title: "Refund when you leave", body: `Convert eligible remaining RWF back to your original currency before departure, minus ${formatUsd(REFUND_DEDUCTION_USD_MINOR)}.` },
] as const;

/** Supported foreign currencies shown in the exchange story. */
const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar", flag: "🇨🇦" },
] as const;

const FAQ_IDS = ["what-is", "sim-needed", "fee", "live-rates", "tip-fee", "end"];

/** Public landing page. Server-rendered; preview figures come from the shared demo ledger. */
export default function LandingPage() {
  const quote = buildTopUpQuote(10_000, "USD", SAMPLE_RATE_BOARD, new Date(SAMPLE_RATE_BOARD.asOf));
  const faqs = HELP_CATEGORIES.flatMap((category) => category.faqs).filter((faq) => FAQ_IDS.includes(faq.id));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand text-ink-inverse">
        <HillsBackdrop />
        <div className="relative mx-auto grid max-w-marketing gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-ink-inverse/20 bg-ink-inverse/10 px-3 py-1 text-xs font-semibold text-accent">
              <FlaskConical className="size-3.5" aria-hidden="true" />
              Product demo · sample data only
            </p>
            <h1 className="type-display mt-5 max-w-xl">Your money in Rwanda, sorted from the moment you land.</h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-inverse/80">
              A planned {WALLET_PERIOD_DAYS}-day Rwandan franc wallet for international visitors. Top up from your card with the rate and
              fee shown up front, pay and tip with eKash QR, and buy roaming data — no local SIM needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/sign-in" size="lg" variant="inverse">
                Explore the demo
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/#how-it-works" size="lg" variant="on-dark">
                How it works
              </ButtonLink>
            </div>
            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-ink-inverse/15 pt-6">
              {[
                { icon: <ShieldCheck className="size-4" />, text: "No local SIM needed" },
                { icon: <Receipt className="size-4" />, text: "Rate shown before you pay" },
                { icon: <Undo2 className="size-4" />, text: "Refund when you leave" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 text-xs font-medium text-ink-inverse/75">
                  <span className="text-accent" aria-hidden="true">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Device mockup showcase */}
          <DeviceShowcase />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-marketing px-4 sm:px-6 lg:px-8">
          <SectionIntro eyebrow="How it works" title="Built around a visitor's stay" description="One wallet from arrival to departure, designed for people who don't have a Rwandan bank account or SIM." />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-xl border border-border bg-surface p-6 shadow-card transition-shadow hover:shadow-raised">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand text-ink-inverse shadow-card" aria-hidden="true">
                    <step.icon className="size-5" />
                  </span>
                  <span className="type-overline text-ink-subtle">Step {index + 1}</span>
                </div>
                <h3 className="type-card-title mt-4 text-ink">{step.title}</h3>
                <p className="type-caption mt-1.5 text-ink-muted">{step.body}</p>
                {index < STEPS.length - 1 ? (
                  <span className="absolute -right-2 top-10 hidden size-4 items-center justify-center lg:flex" aria-hidden="true">
                    <ArrowRight className="size-3.5 text-border-strong" />
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="type-caption mt-6 text-ink-subtle">
            Fees and limits are taken from the pilot requirements and are illustrative — they remain subject to regulator and partner approval.
          </p>
        </div>
      </section>

      {/* Exchange + local access */}
      <section id="exchange" className="scroll-mt-20 bg-canvas py-16 md:py-24">
        <div className="mx-auto max-w-marketing px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Exchange"
            title="Your currency, converted to Rwandan francs"
            description={`Before any top-up you see the amount in your currency, the rate, the 2% fee, and the francs you'll receive. The rate is held for ${QUOTE_LOCK_MINUTES} minutes.`}
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Currency flow visual */}
            <div className="space-y-4">
              <p className="type-overline text-accent-strong">Supported currencies</p>

              {/* Currency cards with layered depth */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand/8 via-surface to-accent-soft p-5 shadow-raised">
                {/* Decorative background circles */}
                <div className="absolute -top-8 -right-8 size-32 rounded-full bg-brand-soft/60" aria-hidden="true" />
                <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-accent-soft/80" aria-hidden="true" />
                <div className="relative grid grid-cols-2 gap-3">
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <div
                      key={currency.code}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-card transition-shadow hover:shadow-raised"
                    >
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-xl shadow-card"
                        aria-hidden="true"
                      >
                        {currency.flag}
                      </span>
                      <div>
                        <p className="font-bold text-ink">{currency.code}</p>
                        <p className="type-caption text-ink-muted">{currency.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion arrow */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
                <div className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink-inverse shadow-raised">
                  <TrendingUp className="size-4" aria-hidden="true" />
                  Converted to RWF
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
              </div>

              {/* RWF destination */}
              <div className="flex items-center gap-4 rounded-xl border-2 border-brand/40 bg-gradient-to-r from-brand-soft to-accent-soft p-4 shadow-card">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-2xl shadow-raised"
                  aria-hidden="true"
                >
                  🇷🇼
                </span>
                <div className="flex-1">
                  <p className="font-bold text-brand-strong">Rwandan Franc (RWF)</p>
                  <p className="type-caption text-ink-muted">Used for all payments in Rwanda</p>
                </div>
                <Globe className="size-5 shrink-0 text-brand/50" aria-hidden="true" />
              </div>

              <ul className="mt-2 space-y-3">
                <Feature icon={<Receipt />} title="Fees shown separately" body="The fee is never hidden inside the rate." />
                <Feature icon={<Clock />} title={`${QUOTE_LOCK_MINUTES}-minute rate lock`} body="Take your time to review; request a fresh quote after it expires." />
                <Feature icon={<Undo2 />} title="Refund when you leave" body="Convert eligible remaining RWF back to your original currency before departure." />
              </ul>
            </div>
            {/* Sample quote */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-raised sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h3 className="type-section-title text-ink">Sample top-up quote</h3>
                <DemoBadge label="Sample rate" />
              </div>
              <dl className="mt-4 divide-y divide-border">
                <DetailRow label="You top up" value={formatMoney(quote.amount)} />
                <DetailRow label="Top-up fee (2%)" value={formatMoney(quote.fee)} />
                <DetailRow label="Charged to your card" value={formatMoney(quote.totalCharged)} />
                <DetailRow label="Rate" value={formatRate("USD", quote.rateMilli)} />
                <DetailRow label="You receive" value={formatMoney({ amountMinor: quote.receiveRwf, currency: "RWF" })} emphasis />
              </dl>
              <p className="type-caption mt-4 text-ink-subtle">
                Sample rate dated {formatDateTime(SAMPLE_RATE_BOARD.asOf)} (Kigali). Not a live, official or guaranteed rate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-marketing px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Local access"
            title="Everything a visitor needs, in one place"
            description="Pay at eKash merchants, send to MTN MoMo and Airtel Money numbers, get data, and find practical guidance for your stay."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="warning" icon={<QrCode aria-hidden="true" />}>Demo flow — simulated</Badge>
            <Badge tone="info" icon={<Smartphone aria-hidden="true" />}>Guide — information only</Badge>
            <Badge tone="neutral" icon={<Signal aria-hidden="true" />}>Not in pilot</Badge>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-soft via-surface to-accent-soft p-6 shadow-raised sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="size-4 text-brand" aria-hidden="true" />
                  <p className="type-overline text-accent-strong">Ready to explore?</p>
                </div>
                <h3 className="type-section-title text-ink">Try every service in the demo</h3>
                <p className="type-caption mt-1.5 text-ink-muted">Sign in with any email and the demo code to explore the full visitor journey.</p>
              </div>
              <ButtonLink href="/sign-in" size="lg" className="shrink-0">
                Open the demo
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section id="transparency" className="scroll-mt-20 bg-canvas py-16 md:py-24">
        <div className="mx-auto max-w-marketing px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Transparency"
            title="What's real in this demo — and what's planned"
            description="We keep a clear line between what this website actually does and what the pilot is designed to do."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-6">
              <h3 className="type-section-title flex items-center gap-2 text-ink">
                <HardDrive className="size-5 text-brand" aria-hidden="true" />
                This demo website
              </h3>
              <ul className="type-body mt-4 space-y-3 text-ink-muted">
                <CheckItem>Runs entirely in your browser. There is no server, database or payment integration.</CheckItem>
                <CheckItem>Rates, balances, merchants and payments are fixed sample data.</CheckItem>
                <CheckItem>Anything you do is saved only in this browser, and cleared when you sign out.</CheckItem>
                <CheckItem>Codes and PINs you type are checked in memory and never saved.</CheckItem>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-surface p-6">
              <h3 className="type-section-title flex items-center gap-2 text-ink">
                <ShieldCheck className="size-5 text-accent-strong" aria-hidden="true" />
                The pilot design (planned)
              </h3>
              <ul className="type-body mt-4 space-y-3 text-ink-muted">
                <CheckItem icon={<Lock />}>Card details handled by the card acquirer&apos;s hosted fields and tokens, not the wallet&apos;s servers.</CheckItem>
                <CheckItem icon={<Lock />}>3-D Secure on every card top-up; prepaid and gift cards blocked.</CheckItem>
                <CheckItem icon={<Lock />}>Larger payments need an email code as well as biometrics or the app PIN.</CheckItem>
                <CheckItem icon={<Lock />}>Every accepted payment either completes or is reversed — and you&apos;re told which.</CheckItem>
              </ul>
              <p className="type-caption mt-4 text-ink-subtle">Planned requirements, not yet independently verified.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionIntro eyebrow="FAQ" title="Questions visitors ask" align="center" />
          <Accordion className="mt-10">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} title={faq.question} name="landing-faq">
                {faq.answer}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
        <div className="mx-auto flex max-w-marketing flex-col items-start gap-6 rounded-xl bg-brand p-8 text-ink-inverse sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="type-page-title">See the full visitor journey</h2>
            <p className="mt-2 max-w-lg text-ink-inverse/80">Sign in with any email and the demo code to explore the wallet, payments, data and guides.</p>
          </div>
          <ButtonLink href="/sign-in" size="lg" variant="inverse">
            Open the demo
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

/** Section heading block used across the landing page. */
function SectionIntro({ eyebrow, title, description, align = "left" }: { eyebrow: string; title: string; description?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "text-center" : undefined}>
      <p className="type-overline text-accent-strong">{eyebrow}</p>
      <h2 className="type-page-title mt-2 text-ink">{title}</h2>
      {description ? <p className={`type-body mt-3 max-w-2xl text-ink-muted ${align === "center" ? "mx-auto" : ""}`}>{description}</p> : null}
    </div>
  );
}

/** Icon + title + body list item. */
function Feature({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface text-brand shadow-card [&_svg]:size-5" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="type-caption mt-0.5 text-ink-muted">{body}</p>
      </div>
    </li>
  );
}

/** Bullet with a small icon. */
function CheckItem({ children, icon = <BadgeCheck /> }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1 shrink-0 text-success [&_svg]:size-4" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

/** Device mockup showcase — illustrative wallet UI, clearly labelled as demo. */
function DeviceShowcase() {
  return (
    <figure
      aria-label="Illustrative product showcase with sample wallet screens"
      className="relative flex justify-center lg:justify-end"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-brand-strong/40 via-transparent to-accent/30 blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/4 -z-10 size-48 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />

      {/* Laptop mockup */}
      <div className="relative w-full max-w-[22rem]">
        {/* Screen bezel */}
        <div className="rounded-2xl border-2 border-ink-inverse/25 bg-gradient-to-b from-ink-inverse/15 to-ink-inverse/5 p-2 shadow-overlay backdrop-blur-sm">
          <div className="overflow-hidden rounded-xl bg-surface text-ink">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-border bg-canvas px-3 py-2">
              <span className="size-2.5 rounded-full bg-danger-border" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-warning-border" aria-hidden="true" />
              <span className="size-2.5 rounded-full bg-success-border" aria-hidden="true" />
              <div className="ml-2 flex-1 rounded-full bg-border/70 px-3 py-0.5 text-[0.6rem] text-ink-subtle">rwandavisitorwallet.com</div>
            </div>
            {/* Wallet balance panel */}
            <div className="relative overflow-hidden bg-brand px-5 py-5 text-ink-inverse">
              {/* Decorative wave */}
              <svg aria-hidden="true" className="absolute -right-4 -bottom-4 h-20 w-32 text-brand-strong/60" viewBox="0 0 130 80">
                <path d="M0 50c25-25 50-38 75-28s42 22 55 4v54H0z" fill="currentColor" />
              </svg>
              <div className="absolute -top-6 -right-6 size-24 rounded-full bg-brand-strong/25" aria-hidden="true" />
              <p className="type-overline text-ink-inverse/60">Available balance</p>
              <p className="type-amount mt-1 text-[1.6rem] leading-tight">RWF 142,500</p>
              <p className="type-caption mt-0.5 text-ink-inverse/60">Day 8 of 30 · Verified tier · <span className="text-accent font-semibold">demo</span></p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink-inverse/15">
                <div className="h-full w-[27%] rounded-full bg-accent" />
              </div>
            </div>
            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-2 p-3">
              {[
                { label: "Pay & Tip", bg: "bg-accent-soft", text: "text-accent-strong", icon: "⚡" },
                { label: "Send", bg: "bg-brand-soft", text: "text-brand-strong", icon: "↗" },
                { label: "Data", bg: "bg-info-soft", text: "text-info", icon: "📶" },
                { label: "Refund", bg: "bg-surface-muted", text: "text-ink-muted", icon: "↩" },
              ].map((action) => (
                <div key={action.label} className={`flex flex-col items-center gap-1 rounded-lg ${action.bg} px-1 py-2`}>
                  <span className="text-sm" aria-hidden="true">{action.icon}</span>
                  <p className={`text-[0.58rem] font-semibold leading-tight text-center ${action.text}`}>{action.label}</p>
                </div>
              ))}
            </div>
            {/* Mini transaction list */}
            <div className="divide-y divide-border px-3 pb-3">
              <p className="type-overline pb-1.5 text-ink-subtle">Recent</p>
              {[
                { name: "Kigali Café · eKash", amount: "-RWF 4,200", color: "text-danger" },
                { name: "MTN MoMo · 078…", amount: "-RWF 10,000", color: "text-danger" },
                { name: "Card top-up · USD", amount: "+RWF 50,000", color: "text-success" },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between py-1.5">
                  <p className="text-[0.65rem] text-ink">{row.name}</p>
                  <p className={`text-[0.65rem] font-semibold tabular ${row.color}`}>{row.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Laptop hinge + base */}
        <div className="mx-auto mt-0.5 h-2 w-4/5 rounded-b-sm bg-ink-inverse/20" aria-hidden="true" />
        <div className="mx-auto h-1 w-full rounded-b-xl bg-ink-inverse/10" aria-hidden="true" />

        {/* Demo label */}
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-inverse/15 px-3 py-1 text-[0.65rem] font-semibold text-ink-inverse/80">
            <FlaskConical className="size-3" aria-hidden="true" />
            Illustrative demo · sample data only
          </span>
        </div>
      </div>

      {/* Tablet mockup — floats right for depth */}
      <div
        className="absolute -right-4 bottom-12 hidden w-36 xl:-right-8 xl:w-44 lg:block"
        aria-hidden="true"
      >
        <div className="rounded-2xl border-2 border-ink-inverse/20 bg-gradient-to-b from-ink-inverse/12 to-ink-inverse/5 p-1.5 shadow-raised">
          <div className="overflow-hidden rounded-xl bg-surface">
            {/* Status bar */}
            <div className="flex items-center justify-between bg-canvas px-2.5 py-1.5">
              <p className="text-[0.5rem] font-bold text-ink-subtle">9:41</p>
              <div className="flex items-center gap-0.5">
                <Wifi className="size-2.5 text-ink-subtle" />
                <Signal className="size-2.5 text-ink-subtle" />
              </div>
            </div>
            <div className="relative overflow-hidden bg-brand px-3 py-3 text-ink-inverse">
              <div className="absolute -top-4 -right-4 size-16 rounded-full bg-brand-strong/30" aria-hidden="true" />
              <p className="text-[0.5rem] font-semibold uppercase tracking-widest text-ink-inverse/60">Balance · demo</p>
              <p className="mt-0.5 text-base font-bold tabular">RWF 142,500</p>
              <p className="text-[0.5rem] text-ink-inverse/60">Day 8 of 30 · Verified</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-2">
              {[
                { label: "Pay", bg: "bg-accent-soft", text: "text-accent-strong" },
                { label: "Send", bg: "bg-brand-soft", text: "text-brand-strong" },
                { label: "Data", bg: "bg-info-soft", text: "text-info" },
                { label: "Refund", bg: "bg-surface-muted", text: "text-ink-muted" },
              ].map((item) => (
                <div key={item.label} className={`rounded-md ${item.bg} py-1.5 text-center`}>
                  <p className={`text-[0.55rem] font-semibold ${item.text}`}>{item.label}</p>
                </div>
              ))}
            </div>
            {/* Home indicator */}
            <div className="flex justify-center py-2">
              <div className="h-0.5 w-10 rounded-full bg-ink-subtle/40" />
            </div>
          </div>
        </div>
      </div>

      <figcaption className="sr-only">Illustrative sample screens — not a live balance</figcaption>
    </figure>
  );
}

/** Decorative hill silhouettes behind the hero. */
function HillsBackdrop() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute inset-x-0 bottom-0 h-48 w-full text-brand-strong" viewBox="0 0 1440 200" preserveAspectRatio="none">
      <path d="M0 140c160-70 300-100 440-60s250 70 400 20 330-110 600-40v140H0z" fill="currentColor" />
      <path d="M0 175c200-40 380-50 560-20s360 40 520 0 260-40 360-25v70H0z" fill="var(--color-brand)" opacity="0.6" />
    </svg>
  );
}

