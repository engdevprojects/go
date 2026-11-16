import { DEMO_STORAGE_KEY } from "@/lib/store/persisted-state";

/** A titled section of a legal document; paragraphs render in order. */
export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
}

/** Date the drafts were last revised (documentation date, not a legal effective date). */
export const LEGAL_DRAFT_DATE = "2026-11-13T00:00:00.000Z";

/**
 * DRAFT Terms of Service. Written from the demo's actual behaviour and the
 * pilot requirements. Requires review by qualified counsel before any use.
 */
export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    id: "draft",
    title: "Draft status",
    paragraphs: [
      "These terms are a working draft prepared for a product demonstration. They have not been reviewed or approved by lawyers or regulators, and they do not form an agreement with anyone.",
    ],
  },
  {
    id: "service",
    title: "The service as designed",
    paragraphs: [
      "GO (Local Access By GO) is designed as a 30-day Rwandan franc wallet for non-residents visiting Rwanda. Visitors would sign up with an email address and a device passkey, top up from a card, pay and tip merchants through eKash, and buy roaming data.",
      "The service is planned to operate only once the relevant bank programme and regulatory approvals are in place. Nothing on this website means those approvals exist.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility and verification",
    paragraphs: [
      "Visitors would complete identity checks (passport, liveness and sanctions screening) that set a wallet tier with its own limits. Some checks may need manual review.",
    ],
  },
  {
    id: "fees",
    title: "Fees",
    paragraphs: [
      "The pilot requirements describe a USD 5 activation fee, a 2% top-up fee, an optional USD 5 extension and a USD 3 deduction when the balance is returned. Payments and tips carry no visitor fee.",
      "All figures are illustrative and subject to regulator and partner approval. Fees would always be shown before you confirm.",
    ],
  },
  {
    id: "rates",
    title: "Exchange rates",
    paragraphs: ["Before a top-up you would see the rate, the fee, the total charged and the francs you receive. A quoted rate would be held for 10 minutes."],
  },
  {
    id: "payments",
    title: "Payments and tips",
    paragraphs: [
      "The merchant or recipient name is shown before you confirm a payment. Please check it — a confirmed payment would be sent to that merchant or number.",
    ],
  },
  {
    id: "expiry",
    title: "Expiry, extension and refunds",
    paragraphs: [
      "The wallet runs for 30 days from activation, with reminders on day 25 and day 29 and one paid extension of 30 days. When it closes, the remaining balance would be converted back and refunded to the original card, minus the deduction. The target is to initiate refunds within one business day; timing on your statement depends on your card issuer.",
    ],
  },
  {
    id: "disputes",
    title: "Disputes and support",
    paragraphs: ["You could raise a dispute or contact support from the app. Disputes are reviewed case by case and an outcome isn't guaranteed."],
  },
  {
    id: "security",
    title: "Keeping your account safe",
    paragraphs: ["Keep your device, passkey and app PIN to yourself, and tell support straight away if you think someone else has used your account."],
  },
  {
    id: "demo",
    title: "This demonstration website",
    paragraphs: [
      "This website uses sample data only. It does not move money, create accounts, send emails, contact payment providers, or provision eSIMs. Anything you do here is simulated and stored only in your own browser.",
    ],
  },
];

/** DRAFT Privacy Policy, separating what this demo does from what is planned. */
export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    id: "draft",
    title: "Draft status",
    paragraphs: [
      "This privacy notice is a working draft for a product demonstration and needs review by qualified counsel and data-protection specialists before any real use.",
    ],
  },
  {
    id: "demo-storage",
    title: "What this demo website stores",
    paragraphs: [
      `This website has no server-side database. It saves demo state in your browser's local storage under the key "${DEMO_STORAGE_KEY}": the email address you typed to sign in, profile edits, preferences, demo transactions, which notifications you've read, demo payment-method nicknames, and the subject lines of demo support requests.`,
      "It does not store verification codes, PINs, card numbers, passport details, or the text of your support messages. Signing out deletes the saved demo state.",
    ],
  },
  {
    id: "camera",
    title: "Camera",
    paragraphs: [
      "If you choose to scan a QR code, the camera is used in your browser only to read the code. Images are not recorded, stored or uploaded, and the camera stops as soon as a code is read or you stop scanning.",
    ],
  },
  {
    id: "tracking",
    title: "Cookies, analytics and third parties",
    paragraphs: [
      "This demo sets no tracking cookies and includes no analytics or advertising scripts. Fonts are served from this website. Links to official government or tourism sites open those sites, which have their own privacy policies.",
    ],
  },
  {
    id: "planned",
    title: "In the planned service",
    paragraphs: [
      "The pilot requirements state that data would be hosted in Rwanda or abroad only with approval under Rwanda's data-protection law, that passport images would be encrypted with retention rules applied, that card details would be handled by the card acquirer rather than the wallet's servers, and that product analytics would exclude personal data.",
      "These are design requirements, not verified practices, and they will be described properly once the service is built and reviewed.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: ["Privacy contact details have not been published for this demo."],
  },
];
