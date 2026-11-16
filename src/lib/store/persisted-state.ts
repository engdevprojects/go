import { z } from "zod";
import { DEFAULT_PREFERENCES } from "@/lib/mock-data/profile";
import { SEED_PAYMENT_METHODS, SEED_READ_NOTIFICATION_IDS } from "@/lib/mock-data/account";
import type { AppNotification } from "@/types/notification";
import type { PaymentMethod } from "@/types/payment-method";
import type { AccountPreferences, EditableProfile } from "@/types/profile";
import type { SupportRequest } from "@/types/support";
import type { Transaction } from "@/types/transaction";

/**
 * Shape of the demo state persisted in this browser, plus its validator.
 *
 * Deliberately excluded: passwords (none exist), OTP codes, PINs, card
 * numbers, and identity documents. Persisted data is a convenience for the
 * demo, not a source of truth and not a security boundary.
 */

export const DEMO_STORAGE_KEY = "rvw.demo.v1";

export interface DemoSession {
  email: string;
  /** Real `Date.now()` at sign-in; drives the demo clock. */
  startedAtMs: number;
}

export interface PendingSignIn {
  email: string;
  /** Real time the demo code was "sent" — for expiry and resend countdowns. */
  codeSentAtMs: number;
}

export interface PersistedDemoState {
  session: DemoSession | null;
  pendingSignIn: PendingSignIn | null;
  profile: EditableProfile | null;
  preferences: AccountPreferences;
  sessionTransactions: Transaction[];
  sessionNotifications: AppNotification[];
  readNotificationIds: string[];
  paymentMethods: PaymentMethod[];
  supportRequests: SupportRequest[];
  premiumApplicationAt: string | null;
  pinChangedAt: string | null;
}

/** Fresh state for a new or signed-out demo. */
export function createInitialState(): PersistedDemoState {
  return {
    session: null,
    pendingSignIn: null,
    profile: null,
    preferences: { ...DEFAULT_PREFERENCES },
    sessionTransactions: [],
    sessionNotifications: [],
    readNotificationIds: [...SEED_READ_NOTIFICATION_IDS],
    paymentMethods: [...SEED_PAYMENT_METHODS],
    supportRequests: [],
    premiumApplicationAt: null,
    pinChangedAt: null,
  };
}

const currency = z.enum(["RWF", "USD", "EUR", "GBP"]);
const money = z.object({ amountMinor: z.number().int(), currency });

const transactionSchema = z.object({
  id: z.string(),
  reference: z.string(),
  type: z.enum(["top_up", "payment", "tip", "mobile_money", "esim_purchase", "activation_fee", "extension_fee", "refund"]),
  status: z.enum(["completed", "pending", "failed", "reversed"]),
  title: z.string(),
  category: z
    .enum(["food_dining", "transport", "activities", "shopping", "connectivity", "transfers", "tips", "service_fees"])
    .nullable(),
  counterparty: z
    .object({
      name: z.string(),
      kind: z.enum(["merchant", "person", "provider", "card"]),
      identifier: z.string().optional(),
    })
    .optional(),
  walletAmountRwf: z.number().int(),
  sourceAmount: money.optional(),
  feeAmount: money.optional(),
  fxRateMilli: z.number().int().optional(),
  tip: z.object({ percent: z.number().nullable(), amountRwf: z.number().int() }).optional(),
  createdAt: z.string(),
  note: z.string().optional(),
  origin: z.enum(["seed", "session"]),
});

const stateSchema = z.object({
  session: z.object({ email: z.string(), startedAtMs: z.number() }).nullable(),
  pendingSignIn: z.object({ email: z.string(), codeSentAtMs: z.number() }).nullable(),
  profile: z.object({ givenName: z.string(), familyName: z.string(), countryCode: z.string() }).nullable(),
  preferences: z.object({
    homeCurrency: z.enum(["USD", "EUR", "GBP"]),
    language: z.enum(["en", "fr"]),
    emailReceipts: z.boolean(),
    spendAlerts: z.boolean(),
    expiryReminders: z.boolean(),
    productNews: z.boolean(),
  }),
  sessionTransactions: z.array(transactionSchema),
  sessionNotifications: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["payment", "top_up", "security", "verification", "expiry", "product"]),
      title: z.string(),
      body: z.string(),
      createdAt: z.string(),
      href: z.string().optional(),
    }),
  ),
  readNotificationIds: z.array(z.string()),
  paymentMethods: z.array(
    z.object({
      id: z.string(),
      brand: z.enum(["visa", "mastercard", "apple_pay", "google_pay"]),
      nickname: z.string(),
      last4: z.string().regex(/^\d{4}$/),
      isDefault: z.boolean(),
      addedAt: z.string(),
    }),
  ),
  supportRequests: z.array(
    z.object({
      reference: z.string(),
      kind: z.enum(["contact", "problem"]),
      subject: z.string(),
      category: z.enum(["payment", "top_up", "exchange", "data_esim", "account", "app_issue", "other"]).optional(),
      transactionReference: z.string().optional(),
      createdAt: z.string(),
      status: z.literal("recorded_locally"),
    }),
  ),
  premiumApplicationAt: z.string().nullable(),
  pinChangedAt: z.string().nullable(),
});

/**
 * Validates unknown JSON from storage. Returns null for anything that doesn't
 * match exactly, so corrupt or outdated data falls back to a fresh state.
 */
export function parsePersistedState(value: unknown): PersistedDemoState | null {
  const result = stateSchema.safeParse(value);
  return result.success ? result.data : null;
}
