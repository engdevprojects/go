import type { ServiceDefinition } from "@/types/service";

/**
 * The visitor services, in display order. `availability` drives the honest
 * label shown on each card: a demo flow, a guide, or not available.
 */
export const SERVICES: readonly ServiceDefinition[] = [
  {
    slug: "pay-tip",
    name: "Pay & Tip",
    summary: "Scan an eKash merchant QR, review the merchant, add a tip.",
    href: "/services/pay-tip",
    icon: "qr-code",
    availability: "demo_flow",
  },
  {
    slug: "mobile-money",
    name: "Mobile Money",
    summary: "Send to MTN MoMo or Airtel Money numbers with a name check.",
    href: "/services/mobile-money",
    icon: "smartphone",
    availability: "demo_flow",
  },
  {
    slug: "esim",
    name: "eSIM & Data",
    summary: "Compare illustrative roaming data plans paid from your wallet.",
    href: "/services/esim",
    icon: "signal",
    availability: "demo_flow",
  },
  {
    slug: "immigration",
    name: "Migration & Stay",
    summary: "Passport details, permitted stay duration and remaining days.",
    href: "/services/immigration",
    icon: "passport",
    availability: "guide",
  },
  {
    slug: "cards",
    name: "Cards",
    summary: "Your top-up cards, and why there's no visitor card yet.",
    href: "/services/cards",
    icon: "credit-card",
    availability: "not_available",
  },
];
