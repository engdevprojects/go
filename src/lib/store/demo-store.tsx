"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { demoNow } from "@/lib/dates";
import { buildReference, buildWalletSummary, sortNewestFirst } from "@/lib/ledger";
import { SEED_NOTIFICATIONS } from "@/lib/mock-data/account";
import { DEMO_PROFILE, DEMO_WALLET_ACCOUNT } from "@/lib/mock-data/profile";
import { SEED_TRANSACTIONS } from "@/lib/mock-data/transactions";
import {
  getClockSnapshot,
  getServerClockSnapshot,
  getServerSnapshot,
  getSnapshot,
  resetState,
  subscribe,
  updateState,
} from "@/lib/store/demo-store-core";
import type { PersistedDemoState } from "@/lib/store/persisted-state";
import type { AppNotification, NotificationView } from "@/types/notification";
import type { PaymentMethod } from "@/types/payment-method";
import type { AccountPreferences, EditableProfile, VisitorProfile } from "@/types/profile";
import type { SupportRequest } from "@/types/support";
import type { NewTransactionInput, Transaction } from "@/types/transaction";
import type { WalletSummary } from "@/types/wallet";

/**
 * React access to the demo store. The provider derives ledger-based values
 * once (sorted transactions, wallet summary, notifications) and shares them.
 * State here is a demo convenience — never authoritative financial state.
 */

/** Everything the demo store exposes to components. */
export interface DemoStoreValue {
  /** False during server render and hydration; true once browser state is read. */
  hydrated: boolean;
  data: PersistedDemoState;
  /** Demo clock; advances every 30 s while the app is open. */
  now: Date;
  profile: VisitorProfile;
  transactions: Transaction[];
  wallet: WalletSummary;
  notifications: NotificationView[];
  unreadCount: number;
}

/** Store mutations. Stable module functions, safe to call from any handler. */
export interface DemoStoreActions {
  startSignIn: (email: string) => void;
  resendCode: () => void;
  completeSignIn: () => void;
  signOut: () => void;
  recordTransaction: (input: NewTransactionInput, notification?: Pick<AppNotification, "kind" | "title" | "body">) => Transaction;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateProfile: (profile: EditableProfile) => void;
  updatePreferences: (preferences: AccountPreferences) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, "id" | "addedAt" | "isDefault">) => PaymentMethod;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  addSupportRequest: (request: Omit<SupportRequest, "reference" | "createdAt" | "status">) => SupportRequest;
  setPremiumApplication: (submitted: boolean) => void;
  recordPinChange: () => void;
}

/** Current demo time for use inside event handlers (not during render). */
function eventNow(): Date {
  return demoNow(getSnapshot().session?.startedAtMs ?? null, Date.now());
}

const ACTIONS: DemoStoreActions = {
  startSignIn: (email) => updateState((state) => ({ ...state, pendingSignIn: { email, codeSentAtMs: Date.now() } })),
  resendCode: () =>
    updateState((state) =>
      state.pendingSignIn ? { ...state, pendingSignIn: { ...state.pendingSignIn, codeSentAtMs: Date.now() } } : state,
    ),
  completeSignIn: () =>
    updateState((state) =>
      state.pendingSignIn
        ? { ...state, pendingSignIn: null, session: { email: state.pendingSignIn.email, startedAtMs: Date.now() } }
        : state,
    ),
  signOut: () => resetState(),
  recordTransaction: (input, notification) => {
    const createdAt = eventNow();
    const sequence = SEED_TRANSACTIONS.length + getSnapshot().sessionTransactions.length + 1;
    const transaction: Transaction = {
      ...input,
      id: `txn-s${String(sequence).padStart(4, "0")}`,
      reference: buildReference(createdAt, sequence),
      createdAt: createdAt.toISOString(),
      origin: "session",
    };
    updateState((state) => ({
      ...state,
      sessionTransactions: [...state.sessionTransactions, transaction],
      sessionNotifications: notification
        ? [
            { ...notification, id: `ntf-${transaction.id}`, createdAt: transaction.createdAt, href: `/transactions/${transaction.id}` },
            ...state.sessionNotifications,
          ]
        : state.sessionNotifications,
    }));
    return transaction;
  },
  markNotificationRead: (id) =>
    updateState((state) =>
      state.readNotificationIds.includes(id) ? state : { ...state, readNotificationIds: [...state.readNotificationIds, id] },
    ),
  markAllNotificationsRead: () =>
    updateState((state) => {
      const all = [...SEED_NOTIFICATIONS, ...state.sessionNotifications].map((notification) => notification.id);
      return { ...state, readNotificationIds: [...new Set([...state.readNotificationIds, ...all])] };
    }),
  updateProfile: (profile) => updateState((state) => ({ ...state, profile })),
  updatePreferences: (preferences) => updateState((state) => ({ ...state, preferences })),
  addPaymentMethod: (method) => {
    const created: PaymentMethod = {
      ...method,
      id: `pm-${method.brand}-${method.last4}-${Date.now().toString(36)}`,
      addedAt: eventNow().toISOString(),
      isDefault: getSnapshot().paymentMethods.length === 0,
    };
    updateState((state) => ({ ...state, paymentMethods: [...state.paymentMethods, created] }));
    return created;
  },
  removePaymentMethod: (id) =>
    updateState((state) => {
      const remaining = state.paymentMethods.filter((method) => method.id !== id);
      const hasDefault = remaining.some((method) => method.isDefault);
      return {
        ...state,
        paymentMethods: hasDefault ? remaining : remaining.map((method, index) => ({ ...method, isDefault: index === 0 })),
      };
    }),
  setDefaultPaymentMethod: (id) =>
    updateState((state) => ({
      ...state,
      paymentMethods: state.paymentMethods.map((method) => ({ ...method, isDefault: method.id === id })),
    })),
  addSupportRequest: (request) => {
    const createdAt = eventNow();
    const created: SupportRequest = {
      ...request,
      reference: `${request.kind === "problem" ? "PRB" : "SUP"}-DEMO-${createdAt.getTime().toString(36).toUpperCase().slice(-6)}`,
      createdAt: createdAt.toISOString(),
      status: "recorded_locally",
    };
    updateState((state) => ({ ...state, supportRequests: [created, ...state.supportRequests] }));
    return created;
  },
  setPremiumApplication: (submitted) =>
    updateState((state) => ({ ...state, premiumApplicationAt: submitted ? eventNow().toISOString() : null })),
  recordPinChange: () => updateState((state) => ({ ...state, pinChangedAt: eventNow().toISOString() })),
};

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

const subscribeNoop = () => () => {};

/**
 * Provides derived demo state. Mount once near the root.
 * Side effects (via the core store): reads/writes localStorage, ticks a clock,
 * and syncs across tabs while mounted.
 */
export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const realNowMs = useSyncExternalStore(subscribe, getClockSnapshot, getServerClockSnapshot);
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const startedAtMs = data.session?.startedAtMs ?? null;
  const now = useMemo(() => demoNow(startedAtMs, realNowMs), [startedAtMs, realNowMs]);
  const transactions = useMemo(() => sortNewestFirst([...SEED_TRANSACTIONS, ...data.sessionTransactions]), [data.sessionTransactions]);
  const wallet = useMemo(() => buildWalletSummary(DEMO_WALLET_ACCOUNT, transactions, now), [transactions, now]);
  const profile = useMemo<VisitorProfile>(
    () => ({ ...DEMO_PROFILE, ...(data.profile ?? {}), email: data.session?.email ?? DEMO_PROFILE.email }),
    [data.profile, data.session],
  );
  const notifications = useMemo<NotificationView[]>(() => {
    const read = new Set(data.readNotificationIds);
    return [...data.sessionNotifications, ...SEED_NOTIFICATIONS]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map((notification) => ({ ...notification, read: read.has(notification.id) }));
  }, [data.readNotificationIds, data.sessionNotifications]);

  const value = useMemo<DemoStoreValue>(
    () => ({
      hydrated,
      data,
      now,
      profile,
      transactions,
      wallet,
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
    }),
    [hydrated, data, now, profile, transactions, wallet, notifications],
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

/**
 * Reads derived demo state.
 * @throws If used outside `DemoStoreProvider` (a wiring bug).
 */
export function useDemoStore(): DemoStoreValue {
  const context = useContext(DemoStoreContext);
  if (!context) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return context;
}

/** Returns the stable store mutation functions. */
export function useDemoActions(): DemoStoreActions {
  return ACTIONS;
}
