import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests for the demo frontend.
 *
 * - Runs against a production build (`next start`) on port 3100, built by the
 *   web server command unless a server is already running locally.
 * - Uses the locally installed Google Chrome by default so no browser
 *   download is needed. Set PLAYWRIGHT_CHANNEL=chromium to use Playwright's
 *   bundled Chromium instead (after `npx playwright install chromium`), e.g. in CI.
 * - Journeys run once at desktop size; responsive and accessibility specs
 *   run at mobile, tablet and desktop sizes.
 */
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;
const channel = process.env.PLAYWRIGHT_CHANNEL === "chromium" ? undefined : (process.env.PLAYWRIGHT_CHANNEL ?? "chrome");
const MULTI_VIEWPORT = /(responsive|accessibility)\.spec\.ts/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // Each worker runs its own Chrome against one `next start`; more than two overloads typical laptops.
  workers: Number(process.env.PLAYWRIGHT_WORKERS ?? 2),
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: BASE_URL,
    channel,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Kigali time so date grouping matches what visitors see.
    timezoneId: "Africa/Kigali",
    locale: "en-GB",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel, viewport: { width: 1440, height: 900 } },
    },
    {
      name: "tablet",
      testMatch: MULTI_VIEWPORT,
      use: { ...devices["Desktop Chrome"], channel, viewport: { width: 820, height: 1180 }, hasTouch: true },
    },
    {
      name: "mobile",
      testMatch: MULTI_VIEWPORT,
      use: { ...devices["Desktop Chrome"], channel, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // A cold production build can exceed 5 minutes on slower machines.
    timeout: 600_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
