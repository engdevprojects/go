import { expect, readState, test } from "./fixtures";

const PROTECTED = ["/dashboard", "/wallet", "/transactions", "/analytics", "/services/pay-tip", "/account", "/account/payment-methods"];

test.describe("route protection", () => {
  for (const path of PROTECTED) {
    test(`redirects signed-out visitors from ${path} to sign-in with a return path`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/sign-in\\?next=${encodeURIComponent(path)}$`));
      await expect(page.getByRole("heading", { level: 1, name: "Sign in to your wallet" })).toBeVisible();
    });
  }

  test("public pages stay public", async ({ page }) => {
    for (const path of ["/", "/about", "/terms", "/privacy"]) {
      await page.goto(path);
      await expect(page).toHaveURL(path);
    }
  });
});

test.describe("demo sign-in", () => {
  test("validates the email and focuses the invalid field", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("button", { name: "Continue" }).click();
    const email = page.getByLabel("Email address");
    await expect(page.getByText("Enter your email address")).toBeVisible();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toBeFocused();
    await email.fill("not-an-email");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Enter a valid email address, like name@example.com")).toBeVisible();
  });

  test("discloses the demo code, rejects a wrong code and returns to the requested page", async ({ page }) => {
    await page.goto("/sign-in?next=%2Fwallet");
    await expect(page.getByText("This is a demo. No email is sent")).toBeVisible();
    await page.getByLabel("Email address").fill("visitor@example.com");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/verify\?next=%2Fwallet/);
    await expect(page.getByText("Demo code: 123456")).toBeVisible();
    await expect(page.getByText(/nothing is sent/i)).toBeVisible();

    await page.getByLabel("Digit 1 of 6").fill("000000");
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await expect(page.getByText("That code isn't right. Check the digits and try again.")).toBeVisible();

    await page.getByLabel("Digit 1 of 6").fill("123456");
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await expect(page).toHaveURL("/wallet");
    await expect(page.getByRole("heading", { level: 1, name: "Wallet & exchange" })).toBeVisible();

    const state = await readState(page);
    expect(JSON.stringify(state)).not.toContain("123456");
    expect(state?.session).toMatchObject({ email: "visitor@example.com" });
  });

  test("ignores unsafe redirect targets", async ({ page }) => {
    await page.goto("/sign-in?next=%2F%2Fevil.example");
    await page.getByLabel("Email address").fill("visitor@example.com");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL("/verify?next=%2Fdashboard");
  });

  test("expires the code after 10 minutes and allows a resend after the cooldown", async ({ page }) => {
    await page.clock.install();
    await page.goto("/sign-in");
    await page.getByLabel("Email address").fill("visitor@example.com");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText(/Code expires in 10:00|Code expires in 9:5\d/)).toBeVisible();

    const resend = page.getByRole("button", { name: /Resend/ });
    await expect(resend).toBeDisabled();
    await page.clock.fastForward("00:31");
    await expect(page.getByRole("button", { name: "Resend code" })).toBeEnabled();

    await page.clock.fastForward("10:00");
    await expect(page.getByText("The code has expired.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Verify and continue" })).toBeDisabled();

    await page.getByRole("button", { name: "Resend code" }).click();
    await expect(page.getByText(/Code expires in (10:00|9:5\d)/)).toBeVisible();
    await page.getByLabel("Digit 1 of 6").fill("123456");
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("explains when there is no verification in progress", async ({ page }) => {
    await page.goto("/verify");
    await expect(page.getByText("Start by entering your email")).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to sign in" })).toBeVisible();
  });
});
