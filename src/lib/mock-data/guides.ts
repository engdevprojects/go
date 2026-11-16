import type { FaqItem, GuideSection, OfficialResource } from "@/types/service";

/**
 * Guide content. Written to point visitors at official sources rather than
 * state eligibility rules, fees, or processing times that can change.
 */

/** Official sites for entry and stay information. */
export const OFFICIAL_RESOURCES: readonly OfficialResource[] = [
  {
    name: "Directorate General of Immigration and Emigration",
    url: "https://www.migration.gov.rw",
    description: "Entry requirements, visas and stay extensions.",
  },
  {
    name: "Irembo",
    url: "https://irembo.gov.rw",
    description: "Rwanda's government services portal, used for online applications.",
  },
  {
    name: "Visit Rwanda",
    url: "https://www.visitrwanda.com",
    description: "Official tourism information for planning your trip.",
  },
];

/** Immigration and stay guidance. */
export const IMMIGRATION_SECTIONS: readonly GuideSection[] = [
  {
    id: "before-travel",
    title: "Before you travel",
    summary: "Entry rules depend on your nationality and purpose of visit, and they change.",
    steps: [
      { title: "Check the official entry rules", body: "Confirm visa requirements for your passport on the Directorate General of Immigration and Emigration website before booking." },
      { title: "Check your passport validity", body: "Make sure your passport meets the validity and blank-page rules stated on the official site." },
      { title: "Check health requirements", body: "Some travellers must show a vaccination certificate depending on where they travel from. Confirm current health guidance before you fly." },
      { title: "Keep copies of key documents", body: "Save digital copies of your passport, visa or approval, and accommodation details somewhere you can reach offline." },
    ],
  },
  {
    id: "on-arrival",
    title: "On arrival",
    summary: "What to have ready at the border.",
    steps: [
      { title: "Have documents ready", body: "Keep your passport, any visa approval, return or onward travel details, and accommodation address to hand." },
      { title: "Note your permitted stay", body: "Check the stay period you were granted. The wallet's 30-day period is unrelated to your immigration status." },
    ],
  },
  {
    id: "extending",
    title: "Extending your stay",
    summary: "Apply before your permitted stay ends — never after.",
    steps: [
      { title: "Apply early", body: "Extensions are handled by the immigration authorities, typically through the official online portal. Start well before your stay ends." },
      { title: "Follow the official checklist", body: "Required documents and fees are set by the authorities. Use the checklist on the official site rather than third-party lists." },
      { title: "Keep proof of your application", body: "Save the confirmation of any application until you have a decision." },
    ],
    faqs: [
      {
        id: "wallet-vs-visa",
        question: "Does extending my wallet extend my visa?",
        answer: "No. The wallet extension (one paid extension of 30 days) only keeps your wallet open. It has no effect on your immigration status.",
      },
    ],
  },
  {
    id: "during-stay",
    title: "During your stay",
    summary: "Practical reminders for a smooth visit.",
    steps: [
      { title: "Carry identification", body: "Keep your passport or a copy with you, as hotels, tour operators and permits often ask for it." },
      { title: "Bring a reusable bag", body: "Rwanda restricts single-use plastic bags. Pack a reusable bag for shopping." },
      { title: "Gorilla and park permits", body: "Book permits through official channels. A verified permit can also move your wallet to the Verified tier." },
    ],
  },
];

/** Refund and dispute guidance, aligned to UR-08, UR-21, UR-22, UR-23 and NFR-14. */
export const REFUND_SECTIONS: readonly GuideSection[] = [
  {
    id: "closing",
    title: "Closing your wallet or reaching day 30",
    summary: "Your remaining balance is converted back and returned to the card you activated with.",
    steps: [
      { title: "Choose to close, or let the period end", body: "You can close early from the app, or the wallet closes automatically at the end of its 30-day period." },
      { title: "Balance converted back", body: "The RWF balance is converted to your card's currency, and a USD 3 deduction is applied (illustrative pricing)." },
      { title: "Refund initiated", body: "The target is to initiate the refund within one business day. Your card issuer controls when it appears on your statement." },
      { title: "Track the status", body: "The refund status is shown in the app until it completes." },
    ],
    faqs: [
      { id: "which-card", question: "Which card receives the refund?", answer: "The original card used to open the wallet. Changing the refund card needs extra verification and a 24-hour hold." },
      { id: "estimate", question: "Can I see how much I'd get back?", answer: "Yes — use the 'Convert back' direction on the Wallet page for a demo estimate using sample rates." },
    ],
  },
  {
    id: "extension",
    title: "Extending instead of closing",
    summary: "One paid extension of 30 days is available (USD 5, illustrative pricing).",
    steps: [
      { title: "Watch for reminders", body: "Reminders arrive on day 25 and day 29 of your wallet period." },
      { title: "Extend once", body: "Pay the extension fee to keep the wallet open for 30 more days. Only one extension is allowed." },
    ],
  },
  {
    id: "failed-payments",
    title: "Failed or reversed payments",
    summary: "Every accepted payment either completes or is reversed — and you are told which.",
    steps: [
      { title: "Check the transaction status", body: "Open the transaction in your history. 'Failed' means no money left the wallet; 'Reversed' means it was returned." },
      { title: "Don't pay twice by accident", body: "If a payment is pending, wait for it to settle before retrying." },
      { title: "Still unsure?", body: "Report a problem and include the transaction reference shown on the receipt." },
    ],
  },
  {
    id: "disputes",
    title: "Disputes with a merchant",
    summary: "If something went wrong with goods or a service, raise a dispute from the app.",
    steps: [
      { title: "Talk to the merchant first", body: "Many issues are fastest to fix directly with the merchant." },
      { title: "Raise a dispute", body: "Use Report a Problem with the transaction reference. A support ticket is created for the operations team." },
      { title: "Keep evidence", body: "Keep receipts, photos and messages that support your case." },
    ],
    faqs: [
      { id: "guarantee", question: "Will I definitely get my money back?", answer: "Not necessarily. A dispute is reviewed case by case. This guide explains the process; it doesn't guarantee an outcome." },
    ],
  },
  {
    id: "card-top-ups",
    title: "Problems with a card top-up",
    summary: "Top-ups are card payments, so your card issuer is also involved.",
    steps: [
      { title: "Check for a hold", body: "A declined top-up can still show briefly as a pending hold on your card. It normally drops off automatically." },
      { title: "Contact support with the reference", body: "If the wallet wasn't credited but your card was charged, report a problem with the top-up reference." },
    ],
  },
];

/** Help Centre FAQ categories. */
export const HELP_CATEGORIES: readonly { id: string; title: string; faqs: FaqItem[] }[] = [
  {
    id: "getting-started",
    title: "Getting started",
    faqs: [
      { id: "what-is", question: "What is GO?", answer: "GO is a 30-day RWF wallet for international visitors: top up from your card, pay merchants and tip by QR or phone number, and buy roaming data. This website is a demo with sample data." },
      { id: "sim-needed", question: "Do I need a Rwandan SIM card?", answer: "No. Accounts are created with an email address and a device passkey — no phone number or SIM is required." },
      { id: "activation", question: "Is there an activation fee?", answer: "The requirements describe a one-off USD 5 activation fee charged to your card, which starts the 30-day period. Pricing is illustrative and subject to approval." },
    ],
  },
  {
    id: "top-ups",
    title: "Top-ups & exchange",
    faqs: [
      { id: "methods", question: "How can I top up?", answer: "With Visa or Mastercard debit or credit cards, Apple Pay or Google Pay. Prepaid and gift cards are blocked." },
      { id: "fee", question: "What does a top-up cost?", answer: "A 2% top-up fee, shown separately before you confirm, along with the rate and the RWF you'll receive." },
      { id: "rate-lock", question: "How long is a quote valid?", answer: "Rates are locked for 10 minutes. After that, request a new quote." },
      { id: "live-rates", question: "Are the rates on this site live?", answer: "No. This demo uses fixed sample rates for illustration only." },
    ],
  },
  {
    id: "payments",
    title: "Payments & tips",
    faqs: [
      { id: "where", question: "Where can I pay?", answer: "At merchants that accept eKash QR payments, including MTN MoMoPay, Airtel and bank merchant QR codes, or by phone number or merchant code." },
      { id: "tip-fee", question: "Do tips cost extra?", answer: "No. Payments and tips carry no visitor fee. Tip presets are 5%, 10% and 15%, or a custom amount." },
      { id: "large-payments", question: "Why was I asked for an email code?", answer: "Payments above USD 500 (equivalent) need an email code as well as Face ID, fingerprint or your app PIN." },
    ],
  },
  {
    id: "data",
    title: "Data & eSIM",
    faqs: [
      { id: "compatible", question: "Will an eSIM work on my phone?", answer: "Your phone must support eSIM and be unlocked. The mobile app checks this before showing plans; unsupported phones are offered a kiosk voucher." },
      { id: "web-esim", question: "Can I install an eSIM from this website?", answer: "No. This demo can't provision or install eSIMs. Installation happens in the mobile app once a provider is integrated." },
    ],
  },
  {
    id: "security",
    title: "Security",
    faqs: [
      { id: "card-data", question: "Does the wallet store my card number?", answer: "The requirements say card details never touch Food Bundles SPV servers — the card acquirer's hosted fields and tokens are used instead." },
      { id: "new-phone", question: "What happens if I sign in on a new phone?", answer: "You'll need an email code, biometric check and selfie match, and your old device is signed out." },
    ],
  },
  {
    id: "expiry",
    title: "Expiry & refunds",
    faqs: [
      { id: "end", question: "What happens after 30 days?", answer: "The balance is converted back and refunded to your original card, minus a USD 3 deduction (illustrative). You can extend once for USD 5 instead." },
      { id: "refund-time", question: "How long does a refund take?", answer: "The target is to initiate it within one business day. When it reaches your account depends on your card issuer." },
    ],
  },
];
