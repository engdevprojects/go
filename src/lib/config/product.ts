import type { TierLimits, WalletTier } from "@/types/wallet";

/**
 * Centralised product rules for the demo.
 *
 * Values come from "Rwanda Visitor Wallet and Visitor Data — Developer
 * Requirements" (23 Oct 2026). That document states every amount and limit is
 * configurable in the back-office and remains subject to BNR, RURA and partner
 * approval — so the UI must present them as illustrative, never final pricing.
 * Money is in integer minor units (USD cents).
 */

/** Product name, matching the mobile app (`mobile/app.json` → "name": "GO"). */
export const PRODUCT_NAME = "GO";
/** Machine-friendly identifier, matching the mobile app slug. */
export const PRODUCT_SLUG = "local-access-go";
/** Line shown beneath the "GO" wordmark. */
export const PRODUCT_SUBLINE = "Local Access By GO";
/** Short descriptive phrase for metadata and headings. */
export const PRODUCT_DESCRIPTOR = "Visitor wallet for Rwanda";
/** Name used wherever the operating company is referenced. */
export const OPERATOR_NAME = PRODUCT_SUBLINE;
export const APP_VERSION = "0.1.0 · web demo";

/** UR-02: one-off activation fee charged to the card. */
export const ACTIVATION_FEE_USD_MINOR = 500;
/** UR-02: the wallet is open for 30 days from activation. */
export const WALLET_PERIOD_DAYS = 30;
/** UR-10: 2% top-up fee, in basis points to keep arithmetic integer. */
export const TOP_UP_FEE_BASIS_POINTS = 200;
/** UR-10: quoted rate is locked for 10 minutes. */
export const QUOTE_LOCK_MINUTES = 10;
/** UR-01: six-digit email code valid for 10 minutes. */
export const OTP_LENGTH = 6;
export const OTP_VALIDITY_MINUTES = 10;
/** Demo-only resend cooldown. Not specified in the requirements. */
export const OTP_RESEND_COOLDOWN_SECONDS = 30;
/** UR-21: one paid extension of 30 days. */
export const EXTENSION_FEE_USD_MINOR = 500;
export const EXTENSION_DAYS = 30;
/** UR-21: reminder days within the 30-day period. */
export const EXPIRY_REMINDER_DAYS = [25, 29] as const;
/** UR-22: deduction when the balance is converted back to the card. */
export const REFUND_DEDUCTION_USD_MINOR = 300;
/** UR-22: refund initiated within one business day (a target, not a promise). */
export const REFUND_TARGET_BUSINESS_DAYS = 1;
/** UR-16: tip presets; payments and tips carry no visitor fee. */
export const TIP_PRESET_PERCENTS = [5, 10, 15] as const;
/** UR-17: payments above USD 500 need email code plus biometric. */
export const HIGH_VALUE_PAYMENT_USD_MINOR = 50_000;
/** UR-13: Standard tier first top-up capped at USD 500 for 24 hours. */
export const STANDARD_FIRST_TOP_UP_CAP_USD_MINOR = 50_000;
/** UR-12: Verified/Premium may top up again only while balance is below USD 2,000. */
export const TOP_UP_BALANCE_THRESHOLD_USD_MINOR = 200_000;

/** UR-03, UR-06, UR-07 tier limits. */
export const TIER_LIMITS: Record<WalletTier, TierLimits> = {
  standard: {
    tier: "standard",
    label: "Standard",
    perConversionUsdMinor: STANDARD_FIRST_TOP_UP_CAP_USD_MINOR,
    rolling30DayUsdMinor: null,
    description: "After identity checks pass. First top-up capped at USD 500 for 24 hours.",
  },
  verified: {
    tier: "verified",
    label: "Verified",
    perConversionUsdMinor: 500_000,
    rolling30DayUsdMinor: 1_500_000,
    description: "Adds a verified gorilla permit or convention badge. USD 5,000 per conversion.",
  },
  premium: {
    tier: "premium",
    label: "Premium",
    perConversionUsdMinor: 1_000_000,
    rolling30DayUsdMinor: 3_000_000,
    description: "Source-of-funds declaration plus a VIP or hospitality ticket, approved by compliance.",
  },
};

/**
 * Fixed code accepted by the demo sign-in. Documented in the README and shown
 * on the verify screen. It is never written to browser storage.
 */
export const DEMO_OTP_CODE = "123456";
