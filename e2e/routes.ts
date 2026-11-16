/** Public routes (no session needed). */
export const PUBLIC_ROUTES = ["/", "/about", "/terms", "/privacy", "/sign-in"] as const;

/**
 * Signed-in routes, including dynamic examples. /services/refunds is omitted:
 * per the website revision brief it now redirects to /wallet (Refund lives there).
 */
export const APP_ROUTES = [
  "/dashboard",
  "/wallet",
  "/transactions",
  "/transactions/txn-0002",
  "/transactions/txn-0015",
  "/analytics",
  "/services",
  "/services/pay-tip",
  "/services/mobile-money",
  "/services/esim",
  "/services/atm-cash",
  "/services/immigration",
  "/services/cards",
  "/account",
  "/account/notifications",
  "/account/verification",
  "/account/payment-methods",
  "/account/change-pin",
  "/account/upgrade",
  "/account/help",
  "/account/contact-support",
  "/account/report-problem",
  "/account/terms",
  "/account/privacy",
  "/account/about",
] as const;
