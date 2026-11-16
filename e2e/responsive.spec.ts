import type { Page } from "@playwright/test";
import { expect, main, seedSignedIn, test } from "./fixtures";
import { APP_ROUTES, PUBLIC_ROUTES } from "./routes";

/** Pixels the document is wider than the viewport (0 = no horizontal scroll). */
async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/** Visible buttons smaller than the WCAG 2.2 minimum target (24×24 CSS px). */
async function undersizedButtons(page: Page): Promise<string[]> {
  return page.locator("button:visible, [role=switch]:visible, [role=radio]:visible").evaluateAll((nodes) =>
    nodes
      .map((node) => ({ node, rect: node.getBoundingClientRect() }))
      .filter(({ node, rect }) => node.closest("label") === null && (rect.width < 24 || rect.height < 24))
      .map(({ node, rect }) => `${node.getAttribute("aria-label") ?? node.textContent?.trim()} ${Math.round(rect.width)}×${Math.round(rect.height)}`),
  );
}

test.describe("layout at this viewport", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`public ${path} fits without horizontal scroll`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      expect(await horizontalOverflow(page)).toBe(0);
    });
  }

  for (const path of APP_ROUTES) {
    test(`signed-in ${path} fits, keeps one h1, and has usable targets`, async ({ page }) => {
      await seedSignedIn(page);
      await page.goto(path);
      await expect(main(page).locator("h1")).toBeVisible();
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await horizontalOverflow(page)).toBe(0);
      expect(await undersizedButtons(page)).toEqual([]);
    });
  }
});

test.describe("navigation pattern", () => {
  test("sidebar on large screens, menu drawer below", async ({ page }) => {
    await seedSignedIn(page);
    await page.goto("/dashboard");
    const width = page.viewportSize()?.width ?? 0;
    const sidebarNav = page.locator("aside").getByRole("navigation", { name: "Main" });
    const menuButton = page.getByRole("button", { name: "Open menu" });
    if (width >= 1024) {
      await expect(sidebarNav).toBeVisible();
      await expect(menuButton).toBeHidden();
    } else {
      await expect(sidebarNav).toBeHidden();
      await expect(menuButton).toBeVisible();
      await menuButton.click();
      await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Wallet & exchange" }).click();
      await expect(page).toHaveURL("/wallet");
    }
  });

  test("tables scroll inside their container instead of the page", async ({ page }) => {
    await seedSignedIn(page);
    await page.goto("/account/upgrade");
    await expect(page.getByRole("table", { name: "Wallet tier comparison" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBe(0);
  });

  test("dialogs fit inside the viewport", async ({ page }) => {
    await seedSignedIn(page);
    await page.goto("/wallet");
    await page.getByLabel("Amount to convert").fill("100");
    await page.getByRole("button", { name: "Review top-up" }).click();
    const panel = page.getByRole("dialog", { name: "Review your top-up" }).locator("> div");
    const box = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(box && viewport).toBeTruthy();
    if (box && viewport) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.height).toBeLessThanOrEqual(viewport.height + 1);
    }
  });
});
