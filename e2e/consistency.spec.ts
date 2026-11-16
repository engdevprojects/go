import { expect, main, seedSignedIn, test } from "./fixtures";

/**
 * After a top-up, a payment with tip, a failed payment, a transfer and an
 * eSIM purchase, every screen must tell the same financial story.
 *
 * Expected ledger: seed balance 205,985
 *   + 137,000 top-up (USD 100)          → added   562,000
 *   − 19,800 payment + tip (18,000+1,800)
 *   −  1,000 FAILED payment (no effect)
 *   −  2,000 transfer
 *   −  6,850 Starter eSIM (USD 5)
 *   = 314,335 balance; Out (completed + pending) 247,665; spend 242,665 (pending 5,000 excluded)
 */
test("dashboard, history, analytics and receipts reconcile after mixed activity", async ({ page }) => {
  test.setTimeout(120_000);
  await seedSignedIn(page);

  await page.goto("/wallet");
  await page.getByLabel("Amount to convert").fill("100");
  await page.getByRole("button", { name: "Review top-up" }).click();
  await page.getByRole("button", { name: "Confirm demo top-up" }).click();
  await page.getByRole("dialog", { name: "Demo top-up complete" }).getByRole("button", { name: "Done" }).click();

  await page.goto("/services/pay-tip");
  await page.getByRole("button", { name: /Umuganura Grill · RWF 18,000/ }).click();
  await page.getByText("10%", { exact: true }).click();
  await page.getByRole("button", { name: "Review payment" }).click();
  await page.getByRole("button", { name: "Pay RWF 19,800 (demo)" }).click();
  await expect(page.getByRole("heading", { name: "Paid RWF 19,800 (simulated)" })).toBeVisible();

  await page.getByRole("button", { name: "Make another payment" }).click();
  await page.getByLabel("Merchant code").fill("EK-100421");
  await page.getByRole("button", { name: "Look up" }).click();
  await page.getByLabel("Amount").fill("1000");
  await page.getByRole("button", { name: "Review payment" }).click();
  await page.getByLabel("Simulate a failed payment").check();
  await page.getByRole("button", { name: "Pay RWF 1,000 (demo)" }).click();
  await expect(page.getByRole("heading", { name: /didn't go through/ })).toBeVisible();

  await page.goto("/services/mobile-money");
  await page.getByLabel("Recipient's mobile number").fill("0788124512");
  await page.getByLabel("Amount").fill("2000");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Send RWF 2,000 (demo)" }).click();
  await expect(page.getByRole("heading", { name: "RWF 2,000 sent (simulated)" })).toBeVisible();

  await page.goto("/services/esim");
  await page.getByRole("button", { name: "Choose Starter" }).click();
  await page.getByRole("button", { name: "Confirm demo purchase" }).click();
  await page.getByRole("dialog", { name: "Purchase recorded (demo)" }).getByRole("button", { name: "Done" }).click();

  await page.goto("/dashboard");
  await expect(main(page).getByText("RWF 314,335").first()).toBeVisible();

  await page.goto("/transactions");
  await expect(main(page).getByText("23 transactions")).toBeVisible();
  await expect(main(page).getByText("RWF 562,000")).toBeVisible();
  await expect(main(page).getByText("RWF 247,665")).toBeVisible();

  await page.goto("/analytics");
  await page.getByText("Whole trip").click();
  await expect(main(page).getByText("RWF 242,665").first()).toBeVisible();
  await expect(main(page).getByText("RWF 562,000")).toBeVisible();
  // USD card charges: seed 5.00 + 200.00 + 4.00, plus the new 100.00 + 2.00 = USD 311.00; EUR stays separate.
  await expect(main(page).getByText("USD 311.00")).toBeVisible();
  await expect(main(page).getByText("EUR 102.00")).toBeVisible();

  await page.goto("/transactions?group=payments");
  await page.getByLabel("Status").selectOption("failed");
  await expect(main(page).locator('a[href^="/transactions/"]')).toHaveCount(2);
});
