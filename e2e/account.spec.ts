import { expect, main, readState, seedSignedIn, STORAGE_KEY, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await seedSignedIn(page);
});

test.describe("account settings", () => {
  test("profile edits validate, save and persist across reloads", async ({ page }) => {
    await page.goto("/account");
    const first = page.getByLabel("First name");
    const save = page.getByRole("button", { name: "Save changes" });
    await expect(save).toBeDisabled();
    await first.fill("");
    await save.click();
    await expect(main(page).getByText("Enter your first name")).toBeVisible();
    await first.fill("Jordan");
    await save.click();
    await expect(page.getByText("Profile updated")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("First name")).toHaveValue("Jordan");
    await expect(page.getByRole("link", { name: "Profile: Jordan Morgan" })).toBeVisible();
  });

  test("preferences switches and home currency persist", async ({ page }) => {
    await page.goto("/account");
    const news = page.getByRole("switch", { name: "Product news" });
    await expect(news).toHaveAttribute("aria-checked", "false");
    await news.click();
    await expect(news).toHaveAttribute("aria-checked", "true");
    await page.getByLabel("Home currency").selectOption("EUR");
    await page.goto("/dashboard");
    await expect(main(page).getByText(/≈ EUR [\d,.]+ at the sample rate/)).toBeVisible();
    const state = await readState(page);
    expect(state?.preferences).toMatchObject({ productNews: true, homeCurrency: "EUR" });
  });

  test("notifications can be marked read individually and all at once", async ({ page }) => {
    await page.goto("/account/notifications");
    await expect(page.getByRole("heading", { level: 1, name: "Notifications" })).toBeVisible();
    await expect(main(page).getByText("You have 2 unread notifications.")).toBeVisible();
    await main(page).getByRole("button", { name: "Mark as read" }).first().click();
    await expect(main(page).getByText("You have 1 unread notification.")).toBeVisible();
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(main(page).getByText("You're all caught up.")).toBeVisible();
    await page.getByText("Unread (0)").click();
    await expect(main(page).getByRole("heading", { name: "No unread notifications" })).toBeVisible();
  });

  test("payment methods: add (no card details), make default, remove with confirmation", async ({ page }) => {
    await page.goto("/account/payment-methods");
    await page.getByRole("button", { name: "Add method" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Add a demo payment method" });
    await expect(dialog.locator("input")).toHaveCount(1);
    await dialog.getByRole("button", { name: "Add method" }).click();
    await expect(dialog.getByText("Give it a name you'll recognise")).toBeVisible();
    await dialog.getByLabel("Nickname").fill("Work card");
    await dialog.getByRole("button", { name: "Add method" }).click();
    await expect(dialog).toBeHidden();
    await expect(main(page).getByText("Work card")).toBeVisible();

    await main(page).locator("li", { hasText: "Work card" }).getByRole("button", { name: "Make default" }).click();
    await expect(main(page).locator("li", { hasText: "Work card" })).toContainText("Default");

    await page.getByRole("button", { name: "Remove Work card" }).click();
    await page.getByRole("dialog", { name: "Remove this method?" }).getByRole("button", { name: "Remove" }).click();
    await expect(main(page).getByText("Work card")).toHaveCount(0);
    await expect(main(page).locator("li", { hasText: "Personal Visa" })).toContainText("Default");
  });

  test("change PIN rejects weak or mismatched PINs and never stores the PIN", async ({ page }) => {
    await page.goto("/account/change-pin");
    await page.getByLabel("Current app PIN").fill("482913");
    await page.getByLabel("New app PIN").fill("123456");
    await page.getByLabel("Confirm new PIN").fill("123456");
    await page.getByRole("button", { name: "Update demo PIN" }).click();
    await expect(main(page).getByText("Avoid repeated or sequential digits")).toBeVisible();
    await page.getByLabel("New app PIN").fill("583920");
    await page.getByLabel("Confirm new PIN").fill("583921");
    await page.getByRole("button", { name: "Update demo PIN" }).click();
    await expect(main(page).getByText("The PINs don't match")).toBeVisible();
    await page.getByLabel("Confirm new PIN").fill("583920");
    await page.getByRole("button", { name: "Update demo PIN" }).click();
    await expect(main(page).getByText("Your demo PIN was changed")).toBeVisible();
    await expect(page.getByLabel("New app PIN")).toHaveValue("");
    const raw = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
    expect(raw).not.toContain("583920");
    expect(raw).not.toContain("482913");
  });

  test("contact support validates and says honestly that nothing was sent", async ({ page }) => {
    await page.goto("/account/contact-support");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(main(page).getByText("Choose a topic")).toBeVisible();
    await expect(main(page).getByText("Add a short subject (at least 5 characters)")).toBeVisible();
    await page.getByLabel("Topic").selectOption("payments");
    await page.getByLabel("Subject").fill("Tip amount question");
    await page.getByLabel("Message").fill("The tip on my last payment looks higher than I expected.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(main(page).getByText(/Recorded with reference SUP-DEMO-/)).toBeVisible();
    await expect(main(page).getByText("not sent", { exact: true })).toBeVisible();
    await expect(main(page).getByText("Tip amount question")).toBeVisible();
  });

  test("report a problem pre-fills a reference and confirms through a review step", async ({ page }) => {
    await page.goto("/account/report-problem?ref=DEMO-0410-0015");
    await expect(page.getByLabel("Transaction reference")).toHaveValue("DEMO-0410-0015");
    await expect(main(page).getByText("Matches: Umuganura Grill")).toBeVisible();
    await page.getByLabel("What's the problem about?").selectOption("payment");
    await page.getByLabel("What happened?").fill("The payment failed but I was asked to pay again.");
    await page.getByRole("button", { name: "Review report" }).click();
    const dialog = page.getByRole("dialog", { name: "Review your report" });
    await expect(dialog).toContainText("DEMO-0410-0015");
    await dialog.getByRole("button", { name: "Submit report" }).click();
    await expect(main(page).getByText(/Report recorded: PRB-DEMO-/)).toBeVisible();
  });

  test("premium application requires both answers and can be withdrawn", async ({ page }) => {
    await page.goto("/account/upgrade");
    await expect(main(page).getByText("No upgrade fee is set in the requirements")).toBeVisible();
    await page.getByRole("button", { name: "Start demo application" }).click();
    const dialog = page.getByRole("dialog", { name: "Apply for Premium (demo)" });
    await dialog.getByRole("button", { name: "Submit for review" }).click();
    await expect(dialog.getByText("Choose your main source of funds")).toBeVisible();
    await expect(dialog.getByText("Premium needs a VIP or hospitality ticket")).toBeVisible();
    await dialog.getByLabel("Main source of funds for this trip").selectOption("Savings");
    await dialog.getByLabel("I hold a VIP or hospitality ticket").check();
    await dialog.getByRole("button", { name: "Submit for review" }).click();
    await expect(main(page).getByText("Premium application pending review (demo)")).toBeVisible();
    await expect(main(page).getByText(/Your tier stays Verified/)).toBeVisible();
    await page.getByRole("button", { name: "Withdraw application" }).click();
    await page.getByRole("dialog", { name: "Withdraw your application?" }).getByRole("button", { name: "Withdraw" }).click();
    await expect(page.getByRole("button", { name: "Start demo application" })).toBeVisible();
  });

  test("every account destination has its own page", async ({ page }) => {
    const destinations = [
      ["/account/verification", "Verification"],
      ["/account/help", "Help Centre"],
      ["/account/terms", "Terms of Service"],
      ["/account/privacy", "Privacy Policy"],
      ["/account/about", "About"],
    ] as const;
    for (const [path, heading] of destinations) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });
});

test.describe("sign-out", () => {
  test("confirms, clears demo data, returns home, and re-protects routes", async ({ page }) => {
    await page.goto("/account");
    await page.getByRole("button", { name: "Sign out" }).click();
    const dialog = page.getByRole("dialog", { name: "Sign out of the demo?" });
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL("/account");

    await page.getByRole("button", { name: "Sign out" }).click();
    await dialog.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");
    expect(await readState(page)).toBeNull();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard/);
  });
});
