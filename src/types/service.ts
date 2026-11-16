import type { SpendingCategory } from "./transaction";

/** Icon keys resolved to Lucide icons by the `ServiceIcon` component. */
export type ServiceIconKey =
  | "banknote"
  | "smartphone"
  | "qr-code"
  | "signal"
  | "passport"
  | "credit-card"
  | "receipt"
  | "arrow-left-right"
  | "chart";

/** How honest the service page can be about what it does in this build. */
export type ServiceAvailability = "demo_flow" | "guide" | "not_available";

/** A service shown on the dashboard, services hub, and landing page. */
export interface ServiceDefinition {
  slug: string;
  name: string;
  summary: string;
  href: string;
  icon: ServiceIconKey;
  availability: ServiceAvailability;
}

/** A sample cash-access point. Locations are illustrative, not verified. */
export interface CashPoint {
  id: string;
  name: string;
  area: string;
  kind: "atm" | "bureau" | "bank_branch";
  networks: string[];
  currencies: string[];
  hours: string;
  note: string;
  /** Position on the schematic map, as percentages (0–100). */
  mapPosition: { x: number; y: number };
}

/** A merchant in the demo eKash directory. */
export interface DemoMerchant {
  code: string;
  name: string;
  category: string;
  /** Analytics category assigned to payments at this merchant. */
  spendingCategory: SpendingCategory;
  venue: string;
  acceptsTips: boolean;
}

/** A mobile-money network that can receive eKash transfers. */
export interface MobileMoneyProvider {
  id: "mtn" | "airtel";
  name: string;
  /** Prefixes of Rwandan numbers on this network (after +250). */
  prefixes: string[];
}

/** A demo person reachable by phone number in the Mobile Money flow. */
export interface DemoRecipient {
  phone: string;
  providerId: MobileMoneyProvider["id"];
  displayName: string;
}

/** An illustrative Option 1 roaming data plan (UR-25). */
export interface DataPlan {
  id: string;
  name: string;
  dataMb: number;
  validityDays: number;
  priceUsdMinor: number;
  summary: string;
}

/** A question-and-answer item used by FAQs and guides. */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** A titled group of guide content with optional steps and FAQs. */
export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  steps?: { title: string; body: string }[];
  faqs?: FaqItem[];
}

/** An external official resource. */
export interface OfficialResource {
  name: string;
  url: string;
  description: string;
}
