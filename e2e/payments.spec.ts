import { expect, main, readState, seedEntry, seedSignedIn, test } from "./fixtures";

interface StoredTransaction {
  status: string;
  type: string;
  walletAmountRwf: number;
}

/** Session transactions recorded so far. */
async function sessionTransactions(page: import("@playwright/test").Page): Promise<StoredTransaction[]> {
  const state = await readState(page);
  const list = state?.sessionTransactions;
  return Array.isArray(list) ? (list as StoredTransaction[]) : [];
}

test.describe("Pay & Tip", () => {
  test("test code → merchant check → 10% tip → confirm records payment and tip", async ({ page }) => {
    await seedSignedIn(page);
    await page.goto("/services/pay-tip");
    await expect(main(page).getByText(/real eKash QR codes are rejected/)).toBeVisible();
    await page.getByRole("button", { name: /Umuganura Grill · RWF 18,000/ }).click();

    await expect(page.getByRole("heading", { name: "Umuganura Grill" })).toBeFocused();
    await expect(main(page).getByText("Found in demo directory")).toBeVisible();
    await expect(page.getByLabel("Amount")).toHaveValue("18000");
    await page.getByText("10%", { exact: true }).click();
    await expect(main(page).getByText("RWF 19,800")).toBeVisible();
    expect(await sessionTransactions(page)).toHaveLength(0);

    await page.getByRole("button", { name: "Review payment" }).click();
    await expect(page.getByRole("heading", { name: "Confirm payment" })).toBeFocused();
    await expect(main(page).getByText("Visitor fee")).toBeVisible();
    await page.getByRole("button", { name: "Pay RWF 19,800 (demo)" }).click();
    await expect(page.getByRole("heading", { name: "Paid RWF 19,800 (simulated)" })).toBeFocused();

    const recorded = await sessionTransactions(page);
    expect(recorded.map((transaction) => [transaction.type, transaction.walletAmountRwf])).toEqual([
      ["payment", -18000],
      ["tip", -1800],
    ]);
    await page.getByRole("link", { name: "View receipt" }).click();
    await expect(main(page).getByText("Simulated eKash payment. No real money moved.")).toBeVisible();
  });

  test("rejects malformed and unknown merchant codes without charging", async ({ page }) => {
    await seedSignedIn(page);
    await page.goto("/services/pay-tip");
    await page.getByLabel("Merchant code").fill("12345");
    await page.getByRole("button", { name: "Look up" }).click();
    await expect(main(page).getByText("Merchant codes look like EK-123456")).toBeVisible();

    await page.getByRole("button", { name: /Unknown merchant/ }).click();
    await expect(page.getByRole("alert").filter({ hasText: "That code can't be paid" })).toContainText("No merchant EK-999999");
    expect(await sessionTransactions(page)).toHaveLength(0);
  });

  test("a simulated failure records a failed attempt that does not change the balance", async ({ page }) => {
    await seedSignedIn(page);
    await page.goto("/services/pay-tip");
    await page.getByLabel("Merchant code").fill("ek-100421");
    await page.getByRole("button", { name: "Look up" }).click();
    await page.getByLabel("Amount").fill("1000");
    await page.getByRole("button", { name: "Review payment" }).click();
    await page.getByLabel("Simulate a failed payment").check();
    await page.getByRole("button", { name: "Pay RWF 1,000 (demo)" }).click();
    await expect(page.getByRole("heading", { name: "Payment didn't go through (simulated)" })).toBeFocused();
    expect((await sessionTransactions(page)).map((transaction) => transaction.status)).toEqual(["failed"]);

    await page.goto("/dashboard");
    await expect(main(page).getByText("RWF 205,985").first()).toBeVisible();
  });

  test("blocks payments larger than the available balance", async ({ page }) => {
    await seedSignedIn(page);
    await page.goto("/services/pay-tip");
    await page.getByLabel("Merchant code").fill("EK-100421");
    await page.getByRole("button", { name: "Look up" }).click();
    await page.getByLabel("Amount").fill("300000");
    await page.getByRole("button", { name: "Review payment" }).click();
    await expect(main(page).getByText("That's more than your available RWF 205,985")).toBeVisible();
  });

  test("payments above USD 500 need the extra email-code step", async ({ page }) => {
    await seedSignedIn(page, [seedEntry(1_000_000)]);
    await page.goto("/services/pay-tip");
    await page.getByLabel("Merchant code").fill("EK-300207");
    await page.getByRole("button", { name: "Look up" }).click();
    await page.getByLabel("Amount").fill("700000");
    await page.getByRole("button", { name: "Review payment" }).click();
    await expect(main(page).getByText("Extra check for payments over USD 500.00")).toBeVisible();
    const pay = page.getByRole("button", { name: "Pay RWF 700,000 (demo)" });
    await pay.click();
    await expect(main(page).getByText("Enter the 6-digit code")).toBeVisible();
    expect((await sessionTransactions(page)).filter((transaction) => transaction.type === "payment")).toHaveLength(0);
    await main(page).getByLabel("Digit 1 of 6").fill("123456");
    await pay.click();
    await expect(page.getByRole("heading", { name: "Paid RWF 700,000 (simulated)" })).toBeVisible();
  });
});

test.describe("Mobile Money", () => {
  test.beforeEach(async ({ page }) => {
    await seedSignedIn(page);
  });

  test("validates the number, network and amount", async ({ page }) => {
    await page.goto("/services/mobile-money");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(main(page).getByText("Enter the recipient's mobile number")).toBeVisible();
    await page.getByLabel("Recipient's mobile number").fill("0751234567");
    await page.getByLabel("Amount").fill("50");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(main(page).getByText("That number isn't on MTN MoMo or Airtel Money")).toBeVisible();
    await expect(main(page).getByText("The minimum is RWF 100")).toBeVisible();
  });

  test("a failed name lookup stops the transfer", async ({ page }) => {
    await page.goto("/services/mobile-money");
    await page.getByLabel("Recipient's mobile number").fill("0731234567");
    await page.getByLabel("Amount").fill("2000");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Name lookup failed" })).toBeVisible();
    expect(await sessionTransactions(page)).toHaveLength(0);
  });

  test("a known number shows the recipient's name before sending", async ({ page }) => {
    await page.goto("/services/mobile-money");
    await page.getByLabel("Recipient's mobile number").fill("+250 788 124 512");
    await page.getByLabel("Amount").fill("2000");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Check the recipient before you send" })).toBeFocused();
    await expect(main(page).getByText("Jean-Paul N.").first()).toBeVisible();
    await expect(main(page).getByText("+250 78• ••4 512").first()).toBeVisible();
    await page.getByRole("button", { name: "Send RWF 2,000 (demo)" }).click();
    await expect(page.getByRole("heading", { name: "RWF 2,000 sent (simulated)" })).toBeFocused();
    expect((await sessionTransactions(page)).map((transaction) => transaction.walletAmountRwf)).toEqual([-2000]);
  });

  test("explains that receiving isn't part of the pilot", async ({ page }) => {
    await page.goto("/services/mobile-money");
    await page.getByText("Receive", { exact: true }).click();
    await expect(main(page).getByText("Receiving isn't part of the pilot")).toBeVisible();
  });
});

test.describe("eSIM & Data", () => {
  test("records a demo purchase and states nothing was activated", async ({ page }) => {
    await seedSignedIn(page);
    await page.goto("/services/esim");
    await expect(main(page).getByText("Popular choice")).toHaveCount(0);
    await page.getByRole("button", { name: "Choose Starter" }).click();
    const dialog = page.getByRole("dialog", { name: "Review: Starter plan" });
    await expect(dialog).toContainText("RWF 6,850");
    await dialog.getByRole("button", { name: "Confirm demo purchase" }).click();
    const done = page.getByRole("dialog", { name: "Purchase recorded (demo)" });
    await expect(done).toContainText("Activation isn't available");
    await expect(done).toContainText("Nothing was installed on your device");
    await done.getByRole("button", { name: "Done" }).click();
    await page.goto("/dashboard");
    await expect(main(page).getByText("RWF 199,135").first()).toBeVisible();
  });

  test("blocks a purchase when the balance is too low", async ({ page }) => {
    await seedSignedIn(page, [seedEntry(-200_000)]);
    await page.goto("/services/esim");
    await page.getByRole("button", { name: "Choose Starter" }).click();
    const dialog = page.getByRole("dialog", { name: "Review: Starter plan" });
    await expect(dialog).toContainText("Not enough balance");
    await expect(dialog.getByRole("button", { name: "Confirm demo purchase" })).toBeDisabled();
  });
});
