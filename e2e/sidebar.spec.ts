import AxeBuilder from "@axe-core/playwright";
import { expect, main, seedSignedIn, test } from "./fixtures";

test.describe("collapsible desktop sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await seedSignedIn(page);
  });

  test("collapses to an icon rail, keeps accessible links, and expands again", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.locator("#app-sidebar");
    const collapse = sidebar.getByRole("button", { name: "Collapse sidebar" });
    await expect(collapse).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar.getByText("Transactions", { exact: true })).toBeVisible();

    await collapse.click();
    const expand = sidebar.getByRole("button", { name: "Expand sidebar" });
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await expect.poll(async () => (await sidebar.boundingBox())?.width ?? 0).toBeLessThanOrEqual(80);

    // Labels are visually hidden but still name the links.
    const link = sidebar.getByRole("link", { name: "Transactions" });
    await expect(link).toBeVisible();
    await link.hover();
    await expect(link.locator("[aria-hidden=true]").filter({ hasText: "Transactions" })).toBeVisible();
    await link.click();
    await expect(page).toHaveURL("/transactions");
    await expect(main(page).getByRole("heading", { level: 1, name: "Transactions" })).toBeVisible();

    // The main content moves over to use the freed space.
    const contentLeft = await main(page).evaluate((element) => element.getBoundingClientRect().left);
    expect(contentLeft).toBeLessThan(200);

    await expand.click();
    await expect(sidebar.getByRole("button", { name: "Collapse sidebar" })).toHaveAttribute("aria-expanded", "true");
    await expect.poll(async () => (await sidebar.boundingBox())?.width ?? 0).toBeGreaterThan(240);
  });

  test("remembers the choice across reloads", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await page.reload();
    await expect(page.locator("#app-sidebar").getByRole("button", { name: "Expand sidebar" })).toBeVisible();
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await page.reload();
    await expect(page.locator("#app-sidebar").getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
  });

  test("keyboard focus reveals the tooltip and the rail passes axe", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/wallet");
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    const sidebar = page.locator("#app-sidebar");
    const analytics = sidebar.getByRole("link", { name: "Analytics" });
    // Reach the link with Tab, as a keyboard user would — tooltips respond to :focus-visible, not script focus.
    for (let press = 0; press < 12 && !(await analytics.evaluate((element) => element === document.activeElement)); press += 1) {
      await page.keyboard.press("Tab");
    }
    await expect(analytics).toBeFocused();
    await expect(analytics.locator("[aria-hidden=true]").filter({ hasText: "Analytics" })).toBeVisible();
    // Scope to the rail: full-page scans are covered by accessibility.spec.ts.
    const { violations } = await new AxeBuilder({ page })
      .include("#app-sidebar")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(violations.map((violation) => violation.id)).toEqual([]);
  });

  test("the unread count stays available when collapsed", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(page.locator("#app-sidebar").getByRole("link", { name: /Notifications, 2 unread/ })).toBeVisible();
  });

  test("the toggle is desktop-only; small screens keep the menu drawer", async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /Collapse sidebar|Expand sidebar/ })).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });
});

test.describe("GO branding", () => {
  test("public pages show the GO name, logo and subline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/^GO — /);
    const home = page.getByRole("banner").getByRole("link", { name: "GO — home" });
    await expect(home).toBeVisible();
    await expect(home).toContainText("Local Access By GO");
    await expect(page.getByText("Rwanda Visitor Wallet")).toHaveCount(0);
    const icon = await page.locator('link[rel="icon"]').first().getAttribute("href");
    expect(icon).toBeTruthy();
  });

  test("signed-in pages use the GO title template", async ({ page }) => {
    await seedSignedIn(page);
    await page.goto("/wallet");
    await expect(page).toHaveTitle("Wallet & exchange · GO");
    await expect(page.getByText("Rwanda Visitor Wallet")).toHaveCount(0);
  });
});
