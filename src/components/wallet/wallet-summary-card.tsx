import { ArrowLeftRight, QrCode, ShieldCheck, Undo2 } from "lucide-react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/misc";
import { TIER_LIMITS, WALLET_PERIOD_DAYS } from "@/lib/config/product";
import { formatDate } from "@/lib/dates";
import { rwfToForeign } from "@/lib/fx";
import { formatMoney } from "@/lib/money";
import type { ForeignCurrencyCode } from "@/types/money";
import type { WalletSummary } from "@/types/wallet";

interface WalletSummaryCardProps {
  wallet: WalletSummary;
  homeCurrency: ForeignCurrencyCode;
  /** Sample rate for the home currency (RWF per unit x1000). */
  homeRateMilli: number;
  showActions?: boolean;
}

/**
 * Hero balance card: RWF balance, an approximate home-currency equivalent at
 * the sample rate, tier, and progress through the 30-day period.
 */
export function WalletSummaryCard({ wallet, homeCurrency, homeRateMilli, showActions = true }: WalletSummaryCardProps) {
  const equivalent = rwfToForeign(wallet.balanceRwf, homeCurrency, homeRateMilli);
  const daysUsed = wallet.dayNumber - 1;
  const expiring = wallet.status === "expiring_soon" || wallet.status === "expired";

  return (
    <section aria-labelledby="wallet-balance-heading" className="relative h-full overflow-hidden rounded-xl bg-brand p-6 text-ink-inverse shadow-raised sm:p-8">
      {/* Decorative background shapes */}
      <svg aria-hidden="true" className="absolute -right-10 -bottom-10 h-48 w-72 text-brand-strong/70" viewBox="0 0 300 200">
        <path d="M0 160c50-60 100-90 150-70s80 50 150 10v100H0z" fill="currentColor" />
      </svg>
      <div className="absolute -top-8 -right-8 size-32 rounded-full bg-brand-strong/25" aria-hidden="true" />
      <div className="absolute top-1/2 -left-12 size-24 rounded-full bg-brand-strong/15" aria-hidden="true" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="wallet-balance-heading" className="type-overline text-ink-inverse/70">
            Available balance
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-inverse/10 px-3 py-1 text-xs font-semibold">
            <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
            {TIER_LIMITS[wallet.tier].label} tier
          </span>
        </div>
        <AnimatedNumber value={wallet.balanceRwf} currency="RWF" className="type-amount mt-3 block text-4xl whitespace-nowrap text-ink-inverse sm:text-5xl" />
        <p className="mt-1.5 text-sm text-ink-inverse/75">
          ≈ {formatMoney({ amountMinor: equivalent, currency: homeCurrency })} at the sample rate · <span className="text-accent font-semibold">demo balance</span>
        </p>

        <div className="mt-6 max-w-md">
          <div className="mb-2 flex justify-between text-xs text-ink-inverse/75">
            <span>Day {wallet.dayNumber} of {WALLET_PERIOD_DAYS}</span>
            <span className={expiring ? "font-semibold text-warning-fill" : undefined}>
              {wallet.status === "expired" ? "Ended" : `${wallet.daysRemaining} ${wallet.daysRemaining === 1 ? "day" : "days"} left`} · ends {formatDate(wallet.expiresAt)}
            </span>
          </div>
          <ProgressBar
            value={daysUsed / WALLET_PERIOD_DAYS}
            label="Wallet period used"
            valueText={`${daysUsed} of ${WALLET_PERIOD_DAYS} days used`}
            tone={expiring ? "warning" : "accent"}
            className="bg-ink-inverse/15"
          />
        </div>

        {showActions ? (
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink href="/wallet" variant="inverse">
              <ArrowLeftRight aria-hidden="true" />
              Add Money
            </ButtonLink>
            <ButtonLink href="/wallet?direction=convert_back" variant="on-dark">
              <Undo2 aria-hidden="true" />
              Refund
            </ButtonLink>
            <ButtonLink href="/services/pay-tip" variant="on-dark">
              <QrCode aria-hidden="true" />
              Pay &amp; Tip
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
