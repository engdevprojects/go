import type { CashPoint, DataPlan, DemoMerchant, DemoRecipient, MobileMoneyProvider } from "@/types/service";

/**
 * DEMO DATA — fictional eKash merchants used by Pay & Tip. Inzovu Mall and
 * Food Bundles restaurants are the pilot venues named in the requirements;
 * the businesses and codes below are invented for the demo.
 */
export const DEMO_MERCHANTS: readonly DemoMerchant[] = [
  { code: "EK-100421", name: "Ikawa Corner Café", category: "Café", spendingCategory: "food_dining", venue: "Inzovu Mall food court", acceptsTips: true },
  { code: "EK-100433", name: "Umuganura Grill", category: "Restaurant", spendingCategory: "food_dining", venue: "Inzovu Mall food court", acceptsTips: true },
  { code: "EK-200118", name: "Food Bundles Kitchen", category: "Restaurant", spendingCategory: "food_dining", venue: "Food Bundles partner restaurant", acceptsTips: true },
  { code: "EK-300207", name: "Kigali Craft Collective", category: "Crafts & gifts", spendingCategory: "shopping", venue: "Sample city-centre shop", acceptsTips: false },
  { code: "EK-400512", name: "Volcano Trail Guides", category: "Tours & activities", spendingCategory: "activities", venue: "Sample tour operator", acceptsTips: true },
  { code: "EK-500090", name: "Kigali Cab Co.", category: "Transport", spendingCategory: "transport", venue: "Sample taxi company", acceptsTips: true },
];

/** Mobile-money networks that receive eKash transfers (UR-28). */
export const MOBILE_MONEY_PROVIDERS: readonly MobileMoneyProvider[] = [
  { id: "mtn", name: "MTN MoMo", prefixes: ["78", "79"] },
  { id: "airtel", name: "Airtel Money", prefixes: ["72", "73"] },
];

/**
 * DEMO DATA — fictional recipients for the name-lookup step (UR-15). Numbers
 * outside this list fail lookup, so nothing is ever "sent" to an unknown number.
 */
export const DEMO_RECIPIENTS: readonly DemoRecipient[] = [
  { phone: "788124512", providerId: "mtn", displayName: "Jean-Paul N." },
  { phone: "791203344", providerId: "mtn", displayName: "Aline M." },
  { phone: "722450981", providerId: "airtel", displayName: "Grace U." },
  { phone: "738001276", providerId: "airtel", displayName: "Eric K." },
];

/**
 * DEMO DATA — illustrative Option 1 roaming data plans (UR-25). Prices,
 * allowances, and coverage are NOT confirmed by any eSIM provider.
 */
export const DEMO_DATA_PLANS: readonly DataPlan[] = [
  { id: "plan-starter", name: "Starter", dataMb: 1_024, validityDays: 7, priceUsdMinor: 500, summary: "For a short stay or a layover." },
  { id: "plan-explorer", name: "Explorer", dataMb: 5_120, validityDays: 30, priceUsdMinor: 700, summary: "Maps, messaging and daily browsing." },
  { id: "plan-adventurer", name: "Adventurer", dataMb: 15_360, validityDays: 30, priceUsdMinor: 1_400, summary: "Video calls and heavier use." },
];

/**
 * DEMO DATA — sample cash-access points. Areas are real Kigali neighbourhoods
 * but the entries, hours, and networks are illustrative and unverified.
 * Nothing here reflects real-time availability.
 */
export const SAMPLE_CASH_POINTS: readonly CashPoint[] = [
  {
    id: "cash-airport",
    name: "Sample ATM — airport arrivals",
    area: "Kigali International Airport",
    kind: "atm",
    networks: ["Visa", "Mastercard"],
    currencies: ["RWF"],
    hours: "Listed as 24 hours (unverified)",
    note: "Convenient on arrival. Your card issuer may charge a foreign withdrawal fee.",
    mapPosition: { x: 82, y: 46 },
  },
  {
    id: "cash-city-centre",
    name: "Sample ATM — city centre",
    area: "Nyarugenge",
    kind: "atm",
    networks: ["Visa", "Mastercard"],
    currencies: ["RWF"],
    hours: "Listed as 24 hours (unverified)",
    note: "Busy at lunchtime; mornings are usually quieter.",
    mapPosition: { x: 30, y: 52 },
  },
  {
    id: "cash-kimihurura",
    name: "Sample bureau de change",
    area: "Kimihurura",
    kind: "bureau",
    networks: [],
    currencies: ["RWF", "USD", "EUR", "GBP"],
    hours: "Business hours (unverified)",
    note: "Licensed bureaux display their rates. Bring your passport.",
    mapPosition: { x: 55, y: 40 },
  },
  {
    id: "cash-remera",
    name: "Sample ATM — Remera",
    area: "Remera",
    kind: "atm",
    networks: ["Visa"],
    currencies: ["RWF"],
    hours: "Listed as 24 hours (unverified)",
    note: "Visa only in this sample entry.",
    mapPosition: { x: 70, y: 58 },
  },
  {
    id: "cash-kacyiru",
    name: "Sample bank branch",
    area: "Kacyiru",
    kind: "bank_branch",
    networks: ["Visa", "Mastercard"],
    currencies: ["RWF", "USD"],
    hours: "Branch hours (unverified)",
    note: "Counter service for currency exchange during branch hours.",
    mapPosition: { x: 48, y: 28 },
  },
  {
    id: "cash-kicukiro",
    name: "Sample ATM — Kicukiro",
    area: "Kicukiro",
    kind: "atm",
    networks: ["Mastercard"],
    currencies: ["RWF"],
    hours: "Listed as 06:00–22:00 (unverified)",
    note: "Mastercard only in this sample entry.",
    mapPosition: { x: 58, y: 76 },
  },
];
