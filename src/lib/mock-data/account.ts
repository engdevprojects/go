import type { AppNotification } from "@/types/notification";
import type { PaymentMethod } from "@/types/payment-method";

/** DEMO DATA — notifications; each one refers to a real seeded transaction or rule. */
export const SEED_NOTIFICATIONS: readonly AppNotification[] = [
  {
    id: "ntf-0006",
    kind: "payment",
    title: "Transfer pending",
    body: "RWF 5,000 to Grace U. (Airtel Money) is pending. The amount is reserved.",
    createdAt: "2027-04-11T05:50:00.000Z",
    href: "/transactions/txn-0017",
  },
  {
    id: "ntf-0005",
    kind: "payment",
    title: "Payment didn't go through",
    body: "RWF 12,000 at Umuganura Grill timed out. Nothing was taken — you retried successfully.",
    createdAt: "2027-04-10T11:20:00.000Z",
    href: "/transactions/txn-0015",
  },
  {
    id: "ntf-0004",
    kind: "top_up",
    title: "Top-up added",
    body: "RWF 151,000 from your Mastercard ending 8819.",
    createdAt: "2027-04-09T07:01:00.000Z",
    href: "/transactions/txn-0011",
  },
  {
    id: "ntf-0003",
    kind: "expiry",
    title: "Your wallet runs until 5 May",
    body: "We'll remind you on day 25 and day 29. You can extend once for 30 days.",
    createdAt: "2027-04-05T09:05:00.000Z",
    href: "/services/refunds",
  },
  {
    id: "ntf-0002",
    kind: "verification",
    title: "Verified tier active",
    body: "Your demo verification is complete. Higher demo limits now apply.",
    createdAt: "2027-04-05T09:30:00.000Z",
    href: "/account/verification",
  },
  {
    id: "ntf-0001",
    kind: "security",
    title: "New sign-in",
    body: "Signed in on a new device. If this wasn't you, contact support.",
    createdAt: "2027-04-05T08:58:00.000Z",
    href: "/account/contact-support",
  },
];

/** Notifications already read when a demo session starts. */
export const SEED_READ_NOTIFICATION_IDS: readonly string[] = ["ntf-0001", "ntf-0002", "ntf-0003", "ntf-0004"];

/** DEMO DATA — fictional, pre-masked top-up methods. */
export const SEED_PAYMENT_METHODS: readonly PaymentMethod[] = [
  { id: "pm-visa-4242", brand: "visa", nickname: "Personal Visa", last4: "4242", isDefault: true, addedAt: "2027-04-05T09:01:00.000Z" },
  { id: "pm-mc-8819", brand: "mastercard", nickname: "Travel Mastercard", last4: "8819", isDefault: false, addedAt: "2027-04-09T06:58:00.000Z" },
];
