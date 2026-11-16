import { expect, main, seedSignedIn, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await seedSignedIn(page);
});

/** Rows in the history list are links to receipts. */
const rows = (page: import("@playwright/test").Page) => main(page).locator('a[href^="/transactions/"]');

test.describe("transaction history", () => {
  test("lists all seeded transactions grouped by day with reconciling totals", async ({ page }) => {
    await page.goto("/transactions");
    await expect(rows(page)).toHaveCount(10);
    await expect(main(page).getByText("17 transactions")).toBeVisible();
    await expect(main(page).getByText("RWF 425,000")).toBeVisible();
    await expect(main(page).getByText("RWF 219,015")).toBeVisible();
    await expect(main(page).getByRole("heading", { level: 2, name: /Today · Sunday 11 April/ })).toBeVisible();
    await page.getByRole("button", { name: "Show more" }).click();
    await expect(rows(page)).toHaveCount(17);
  });

  test("search, type, status and sort filters narrow the list", async ({ page }) => {
    await page.goto("/transactions");
    await page.getByLabel("Search transactions").fill("ikawa");
    await expect(rows(page)).toHaveCount(2);
    await page.getByLabel("Search transactions").fill("");

    await page.getByText("Top-ups & refunds").click();
    await expect(rows(page)).toHaveCount(2);
    await page.getByText("All", { exact: true }).click();

    await page.getByLabel("Status").selectOption("failed");
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first()).toContainText("Failed");
    await page.getByLabel("Status").selectOption("all");

    await page.getByLabel("Sort").selectOption("amount_high");
    await expect(rows(page).first()).toContainText("RWF 274,000");
  });

  test("shows an empty state with a working reset", async ({ page }) => {
    await page.goto("/transactions");
    await page.getByLabel("Search transactions").fill("no-such-merchant");
    await expect(main(page).getByRole("heading", { name: "No transactions match" })).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(rows(page)).toHaveCount(10);
  });

  test("honours ?group= from links elsewhere in the app", async ({ page }) => {
    await page.goto("/transactions?group=top_ups");
    await expect(rows(page)).toHaveCount(2);
  });
});

test.describe("receipts", () => {
  test("a completed top-up shows card amount, fee and sample rate", async ({ page }) => {
    await page.goto("/transactions/txn-0002");
    const receipt = main(page).locator("article");
    await expect(receipt).toContainText("DEMO-0405-0002");
    await expect(receipt).toContainText("USD 200.00");
    await expect(receipt).toContainText("USD 4.00");
    await expect(receipt).toContainText("USD 204.00");
    await expect(receipt).toContainText("+RWF 274,000");
    await expect(main(page).getByText("It is not an EBM tax receipt")).toBeVisible();
  });

  test("a failed payment shows no wallet effect", async ({ page }) => {
    await page.goto("/transactions/txn-0015");
    await expect(main(page).getByText("No money left your wallet.")).toBeVisible();
    await expect(main(page).getByText("None — payment failed")).toBeVisible();
  });

  test("a pending transfer is shown as reserved", async ({ page }) => {
    await page.goto("/transactions/txn-0017");
    await expect(main(page).getByText("−RWF 5,000 (reserved)")).toBeVisible();
  });

  test("share falls back to copying when Web Share is unavailable", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    });
    await page.goto("/transactions/txn-0003");
    await page.getByRole("button", { name: "Share" }).click();
    await expect(page.getByText("Receipt copied")).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain("DEMO-0405-0003");
    expect(clipboard).toContain("Demo receipt — sample data, not a real transaction.");
  });

  test("unknown ids show a not-found page with a way back", async ({ page }) => {
    await page.goto("/transactions/does-not-exist");
    await expect(page.getByRole("heading", { level: 1, name: "Transaction not found" })).toBeVisible();
    await page.getByRole("link", { name: "Back to transactions" }).click();
    await expect(page).toHaveURL("/transactions");
  });
});
