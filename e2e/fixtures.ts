import { test as base, expect, type Page } from "@playwright/test";

/** localStorage key used by the demo store (see src/lib/store/persisted-state.ts). */
export const STORAGE_KEY = "rvw.demo.v1";

/** Seeded balance from the demo ledger (asserted by unit tests too). */
export const SEED_BALANCE = "RWF 205,985";

/** A valid signed-in demo state matching the persisted-state schema. */
export function signedInState(email = "e2e.visitor@example.com") {
  return {
    session: { email, startedAtMs: Date.now() },
    pendingSignIn: null,
    profile: null,
    preferences: { homeCurrency: "USD", language: "en", emailReceipts: true, spendAlerts: true, expiryReminders: true, productNews: false },
    sessionTransactions: [],
    sessionNotifications: [],
    readNotificationIds: ["ntf-0001", "ntf-0002", "ntf-0003", "ntf-0004"],
    paymentMethods: [
      { id: "pm-visa-4242", brand: "visa", nickname: "Personal Visa", last4: "4242", isDefault: true, addedAt: "2027-04-05T09:01:00.000Z" },
      { id: "pm-mc-8819", brand: "mastercard", nickname: "Travel Mastercard", last4: "8819", isDefault: false, addedAt: "2027-04-09T06:58:00.000Z" },
    ],
    supportRequests: [],
    premiumApplicationAt: null,
    pinChangedAt: null,
  };
}

/** A ledger entry to add to the seeded state (shape of the persisted Transaction). */
export interface SeedTransaction {
  id: string;
  reference: string;
  type: "top_up" | "payment";
  status: "completed" | "failed" | "pending" | "reversed";
  title: string;
  category: "food_dining" | null;
  walletAmountRwf: number;
  createdAt: string;
  origin: "session";
}

/**
 * Seeds a signed-in demo session before the first page load only. A
 * sessionStorage flag stops later navigations in the same test from
 * resetting state, so multi-page journeys keep their changes.
 * @param extraTransactions Optional ledger entries (e.g. to raise or lower the balance).
 */
export async function seedSignedIn(page: Page, extraTransactions: SeedTransaction[] = []): Promise<void> {
  await page.addInitScript(
    ({ key, state }) => {
      if (window.sessionStorage.getItem("__e2e_seeded")) return;
      window.localStorage.setItem(key, JSON.stringify(state));
      window.sessionStorage.setItem("__e2e_seeded", "1");
    },
    { key: STORAGE_KEY, state: { ...signedInState(), sessionTransactions: extraTransactions } },
  );
}

/** Builds a seed ledger entry that moves the balance by `walletAmountRwf`. */
export function seedEntry(walletAmountRwf: number, status: SeedTransaction["status"] = "completed"): SeedTransaction {
  const credit = walletAmountRwf > 0;
  return {
    id: `txn-e2e-${Math.abs(walletAmountRwf)}-${status}`,
    reference: "DEMO-0411-0900",
    type: credit ? "top_up" : "payment",
    status,
    title: credit ? "E2E top-up" : "E2E payment",
    category: credit ? null : "food_dining",
    walletAmountRwf,
    createdAt: "2027-04-11T07:00:00.000Z",
    origin: "session",
  };
}

/** Reads the persisted demo state from the page. */
export async function readState(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  }, STORAGE_KEY);
}

/** Collects uncaught page errors and console errors for a test. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !/404 \(Not Found\)/.test(message.text())) errors.push(message.text());
  });
  return errors;
}

/** The main content landmark, used to scope assertions away from the nav. */
export function main(page: Page) {
  return page.locator("#main-content");
}

/**
 * Base test that fails on any uncaught page error or console error. The
 * fixture is `auto`, so every test is guarded without requesting it.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors = collectErrors(page);
      await use(errors);
      expect(errors, "page/console errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
