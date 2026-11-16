# GO — web (demo)

Visitor-facing web frontend for **GO** (Local Access By GO), a 30-day RWF wallet concept for international visitors to Rwanda. The name and slug (`local-access-go`) match the mobile app.

> **Demo only.** Every balance, exchange rate, merchant, payment, verification result and eSIM plan is sample data. Nothing is sent to a server, no money moves, and nothing here implies a licence, regulatory approval, or provider integration.

## Run it

Requires Node.js 20.9+ (tested with 22.13).

```bash
npm install
npm run dev          # http://localhost:3000
```

Quality checks:

```bash
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # eslint (next core-web-vitals + typescript)
npm test             # vitest unit tests
npm run build        # production build (type and lint errors fail the build)
```

> If your global npm config sets `legacy-peer-deps=true`, peer dependencies aren't auto-installed. `vite` is therefore listed explicitly as a dev dependency for Vitest.

## Demo sign-in

1. Open `/sign-in` and enter **any** email address (no email is sent, no password exists — the requirements specify email + device passkey).
2. On `/verify`, enter the demo code **`123456`**. It's shown on screen, valid for 10 minutes, and can be "resent" after 30 seconds.
3. Signing out (Profile → Sign out) deletes all demo state saved in the browser.

## What's in it

| Area | Routes |
| --- | --- |
| Public | `/`, `/about`, `/terms`, `/privacy` |
| Auth | `/sign-in`, `/verify` |
| Wallet | `/dashboard`, `/wallet`, `/transactions`, `/transactions/[id]`, `/analytics` |
| Services | `/services`, `/services/pay-tip`, `/services/mobile-money`, `/services/esim`, `/services/atm-cash`, `/services/immigration`, `/services/refunds`, `/services/cards` |
| Account | `/account` (profile), `/account/notifications`, `/verification`, `/payment-methods`, `/change-pin`, `/upgrade`, `/help`, `/contact-support`, `/report-problem`, `/terms`, `/privacy`, `/about` |

### Demo test paths

- **Pay & Tip** without a camera: use the "Test codes" buttons, or enter merchant code `EK-100421`. Demo QR payload format: `rvw-demo:pay?code=EK-100421[&amount=6500]`. Only the local merchant directory supplies merchant names; real eKash QR codes are rejected. A "Simulate a failed payment" checkbox previews the failure/retry path.
- **Camera scanning** needs HTTPS or `localhost`, camera permission, and a browser with `BarcodeDetector` (Chromium-based browsers on Android/desktop). Elsewhere the page explains the limitation and offers the test path.
- **Mobile Money**: only these fictional numbers pass the name lookup: `0788124512`, `0791203344` (MTN), `0722450981`, `0738001276` (Airtel).
- **High-value step-up**: payments above USD 500 equivalent ask for the demo email code — top up first to try it.

## Architecture

```
src/
  app/                 Next.js App Router
    (marketing)/       public pages (server components)
    (auth)/            sign-in + verify
    (app)/             signed-in area — AppShell layout with demo route guard
  components/
    ui/                design-system primitives (Button, Card, Dialog, FormField, OTP, Toast…)
    layout/            AppShell, sidebar, headers, PageHeader, brand
    finance/           CurrencyAmount, TransactionRow, status badges, ServiceCard, StatCard
    wallet/ transactions/ analytics/ services/ account/ legal/ dashboard/ auth/
  lib/
    config/            product rules (fees, limits, OTP) and navigation
    mock-data/         the single deterministic dataset (ledger, rates, merchants, guides…)
    store/             demo store (useSyncExternalStore + validated localStorage)
    validation/        Zod schemas for every form
    money.ts fx.ts ledger.ts analytics.ts payments.ts qr-payload.ts dates.ts
  types/               domain types
tests/                 vitest unit tests
```

### Data model and consistency

- **One ledger.** `lib/mock-data/transactions.ts` is the only source of seeded activity. Each entry records `walletAmountRwf`, its signed effect on the RWF balance. The balance, dashboard, history, receipts and analytics are all derived from it, so they always reconcile (seed balance: RWF 205,985 — covered by a test).
- **One rate board.** `lib/mock-data/rates.ts` holds the sample USD/EUR/GBP rates used everywhere.
- **Money is integer.** Amounts are integer minor units; rates are integer RWF-per-unit × 1000; user input is parsed from strings without floats.
- **No cross-currency sums.** Wallet analytics are RWF; card charges are summed per currency only.
- **Demo clock.** The app is anchored to 11 April 2027 (pilot period, Kigali time) and advances in real time from sign-in, so dates and countdowns stay deterministic.

### State and persistence

`lib/store/` exposes the demo state through `useSyncExternalStore`. The server snapshot is a fixed default (no hydration mismatches); the client snapshot is loaded from `localStorage` key `rvw.demo.v1` and validated with Zod — corrupt data is discarded. It stores the sign-in email, profile edits, preferences, demo transactions, notification read state, payment-method nicknames and support-request subjects. It never stores codes, PINs, card numbers, passport data, or message bodies. **It is not a security boundary** — the route guard is UX only.

### Product rules

`lib/config/product.ts` centralises values from *Rwanda Visitor Wallet and Visitor Data — Developer Requirements* (23 Oct 2026): USD 5 activation, 30-day wallet, 2% top-up fee, 10-minute rate lock, 6-digit/10-minute OTP, tips 5/10/15%, USD 500 step-up threshold, tier limits, USD 5 extension, USD 3 refund deduction. The document says these remain subject to approval, so the UI labels them as illustrative.

## Brand

- Name **GO**, subline **Local Access By GO**, slug `local-access-go` — matching the mobile app (`mobile/app.json`). Defined once in `src/lib/config/product.ts`.
- Logo: `src/assets/brand/go-logo.png` (downloaded from the Cloudinary `Go_logo` asset and served locally, so the site has no runtime dependency on Cloudinary). The same file is the favicon (`src/app/icon.png`, `src/app/apple-icon.png`). It is a 150×150 PNG, so it is used at small sizes only.
- `BrandLogo` (`src/components/layout/brand-logo.tsx`) shows the logo with the "GO" wordmark and subline; `compact` shows the logo only (collapsed sidebar).
- Internal identifiers that still say `rvw` are intentional and not user-facing: the storage key `rvw.demo.v1` (renaming would discard saved demo state), the demo QR scheme `rvw-demo:` (printed test codes keep working) and CSS keyframe names.

## Sidebar

On desktop (≥ 1024 px) the dashboard sidebar collapses to an icon rail with the toggle at its top ("Collapse sidebar" / "Expand sidebar"). Collapsed items keep their accessible names, show a tooltip on hover or keyboard focus, and the choice is remembered in this browser (`go.ui.sidebar-collapsed`). The mobile menu drawer is unchanged.

## Known limitations

- No backend, API, real authentication, passkeys, payments, KYC, eSIM provisioning or email. All flows are simulated.
- The requirements describe the *web* deliverable as a back-office dashboard; this project is a visitor-facing web demo, built as requested.
- The mobile app's per-exchange "USD 5 Local Access service fee" isn't in the requirements, so the web shows USD 5 only as the activation/extension fee.
- No real logo was supplied (the mobile `icon.png` is the Expo template icon), so an original placeholder mark is used.
- English only; French is listed as planned. Light theme only.
- Camera QR decoding relies on the browser `BarcodeDetector` API (not available in Firefox or Safari at the time of writing).
- ATM locations, immigration links and guidance are illustrative/unverified; official links point to government and tourism sites.
- Automated tests cover the domain logic; there are no component or end-to-end browser tests yet.
