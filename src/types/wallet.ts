/** Wallet tiers from the requirements (UR-03, UR-06, UR-07). */
export type WalletTier = "standard" | "verified" | "premium";

/** Lifecycle status of the 30-day wallet. */
export type WalletStatus = "not_activated" | "active" | "expiring_soon" | "expired" | "closed";

/** Static facts about the demo wallet. Balance is derived, never stored. */
export interface WalletAccount {
  walletId: string;
  tier: WalletTier;
  activatedAt: string;
  expiresAt: string;
}

/** Wallet figures derived from the ledger for display. */
export interface WalletSummary extends WalletAccount {
  status: WalletStatus;
  balanceRwf: number;
  /** Current day of the period, 1–30 (day 1 starts at activation). */
  dayNumber: number;
  /** Whole days left after today, so `dayNumber + daysRemaining` = 30 while active. */
  daysRemaining: number;
  totalAddedRwf: number;
  totalSpentRwf: number;
}

/** Per-tier limits in USD minor units (configurable product rules). */
export interface TierLimits {
  tier: WalletTier;
  label: string;
  perConversionUsdMinor: number;
  rolling30DayUsdMinor: number | null;
  description: string;
}
