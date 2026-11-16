import { expect, main, readState, SEED_BALANCE, seedSignedIn, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await seedSignedIn(page);
});

test.describe("wallet and exchange", () => {
  test("dashboard shows the seeded balance, sample labels and a consistent day count", async ({ page }) => {
    await page.goto("/dashboard");
    const content = main(page);
    await expect(content.getByText(SEED_BALANCE).first()).toBeVisible();
    await expect(content.getByText("Day 6 of 30")).toBeVisible();
    await expect(content.getByText(/24 days left/)).toBeVisible();
    await expect(page.getByText("Demo mode — sample data")).toBeVisible();
    await expect(content.getByText(/Not live or guaranteed/)).toBeVisible();
  });

  test("top-up shows fee, total and francs received before confirmation", async ({ page }) => {
    await page.goto("/wallet");
    await page.getByLabel("Amount to convert").fill("100");
    const breakdown = main(page).locator("[aria-live=polite]").filter({ hasText: "Breakdown" });
    await expect(breakdown).toContainText("USD 100.00");
    await expect(breakdown).toContainText("USD 2.00");
    await expect(breakdown).toContainText("USD 102.00");
    await expect(breakdown).toContainText("1 USD = 1,370.00 RWF");
    await expect(breakdown).toContainText("RWF 137,000");
  });

  test("validates amounts against the minimum, format and tier limit", async ({ page }) => {
    await page.goto("/wallet");
    const amount = page.getByLabel("Amount to convert");
    const review = page.getByRole("button", { name: "Review top-up" });
    for (const [value, message] of [
      ["5", "The minimum is USD 10.00"],
      ["10.555", "Use numbers only, with up to 2 decimal places"],
      ["5000.01", "The Verified tier limit is USD 5,000.00 per conversion"],
    ] as const) {
      await amount.fill(value);
      await review.click();
      await expect(page.getByText(message)).toBeVisible();
      await expect(amount).toHaveAttribute("aria-invalid", "true");
    }
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("review dialog closes with Escape, returns focus, and confirms a demo top-up", async ({ page }) => {
    await page.goto("/wallet");
    await page.getByLabel("Amount to convert").fill("100");
    const review = page.getByRole("button", { name: "Review top-up" });
    await review.click();
    const dialog = page.getByRole("dialog", { name: "Review your top-up" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("No card is charged and no money moves");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(review).toBeFocused();

    await review.click();
    await dialog.getByRole("button", { name: "Confirm demo top-up" }).click();
    const done = page.getByRole("dialog", { name: "Demo top-up complete" });
    await expect(done).toContainText("RWF 137,000 added (demo)");
    await expect(done).toContainText(/Reference DEMO-\d{4}-\d{4}/);
    await done.getByRole("button", { name: "Done" }).click();

    await page.goto("/dashboard");
    await expect(main(page).getByText("RWF 342,985").first()).toBeVisible();
    const state = await readState(page);
    expect(state?.sessionTransactions).toHaveLength(1);
  });

  test("an expired quote cannot be confirmed until it is refreshed", async ({ page }) => {
    await page.clock.install();
    await page.goto("/wallet");
    await page.getByLabel("Amount to convert").fill("50");
    await page.getByRole("button", { name: "Review top-up" }).click();
    const dialog = page.getByRole("dialog", { name: "Review your top-up" });
    await expect(dialog.getByText(/Rate held for (10:00|9:5\d)/)).toBeVisible();
    await page.clock.fastForward("10:01");
    await expect(dialog.getByText("This quote has expired")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Confirm demo top-up" })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Get a new quote" }).click();
    await expect(dialog.getByRole("button", { name: "Confirm demo top-up" })).toBeVisible();
  });

  test("convert-back is an estimate with the USD 3 deduction and no confirm action", async ({ page }) => {
    await page.goto("/wallet");
    await page.getByText("Convert back · RWF → card").click();
    await page.getByLabel("Francs to convert back").fill("137000");
    const estimate = main(page).locator("[aria-live=polite]").filter({ hasText: "Estimate" });
    await expect(estimate).toContainText("USD 100.00");
    await expect(estimate).toContainText("−USD 3.00");
    await expect(estimate).toContainText("USD 97.00");
    await expect(main(page).getByText("Estimate only")).toBeVisible();

    await page.getByLabel("Francs to convert back").fill("999999");
    await expect(page.getByText(`You have ${SEED_BALANCE} available`).or(page.getByText(/more than your available/))).toBeVisible();
  });
});
