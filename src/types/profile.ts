import type { ForeignCurrencyCode } from "./money";
import type { WalletTier } from "./wallet";

/** Interface languages named in the requirements (English and French). */
export type InterfaceLanguage = "en" | "fr";

/** Identity verification state shown to the visitor (demo only). */
export type VerificationStatus = "not_started" | "in_review" | "verified" | "action_required";

/**
 * The demo visitor. Contains no real identity data; the passport field is a
 * pre-masked fictional suffix only, never a full document number.
 */
export interface VisitorProfile {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  /** ISO 3166-1 alpha-2 country of residence. */
  countryCode: string;
  maskedPassport: string;
  verificationStatus: VerificationStatus;
  tier: WalletTier;
  memberSince: string;
}

/** Fields a visitor may edit in the demo profile form. */
export type EditableProfile = Pick<VisitorProfile, "givenName" | "familyName" | "countryCode">;

/** Account preferences persisted locally in the demo. */
export interface AccountPreferences {
  homeCurrency: ForeignCurrencyCode;
  language: InterfaceLanguage;
  emailReceipts: boolean;
  spendAlerts: boolean;
  expiryReminders: boolean;
  productNews: boolean;
}
