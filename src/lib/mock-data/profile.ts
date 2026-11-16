import type { AccountPreferences, VisitorProfile } from "@/types/profile";
import type { WalletAccount } from "@/types/wallet";

/**
 * DEMO DATA — a fictional visitor. No real person, passport, or account.
 * The passport value is a pre-masked fictional suffix only.
 */
export const DEMO_PROFILE: VisitorProfile = {
  id: "visitor-demo-001",
  givenName: "Alex",
  familyName: "Morgan",
  email: "demo.visitor@example.com",
  countryCode: "GB",
  maskedPassport: "••••••• 21",
  verificationStatus: "verified",
  tier: "verified",
  memberSince: "2027-04-05T09:00:00.000Z",
};

/** DEMO DATA — the visitor's 30-day wallet (activated on arrival, 5 April 2027). */
export const DEMO_WALLET_ACCOUNT: WalletAccount = {
  walletId: "RVW-DEMO-0001",
  tier: "verified",
  activatedAt: "2027-04-05T09:02:00.000Z",
  expiresAt: "2027-05-05T09:02:00.000Z",
};

/** Default preferences for a new demo session. */
export const DEFAULT_PREFERENCES: AccountPreferences = {
  homeCurrency: "USD",
  language: "en",
  emailReceipts: true,
  spendAlerts: true,
  expiryReminders: true,
  productNews: false,
};

/** Countries offered in the profile form (residence, not nationality). */
export const COUNTRY_OPTIONS: readonly { code: string; name: string }[] = [
  { code: "AU", name: "Australia" },
  { code: "BE", name: "Belgium" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "NL", name: "Netherlands" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];
