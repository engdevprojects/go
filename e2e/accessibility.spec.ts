import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, main, seedSignedIn, test } from "./fixtures";
import { APP_ROUTES, PUBLIC_ROUTES } from "./routes";

/** WCAG 2.0/2.1/2.2 level A and AA rules. */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Runs axe on the current page and returns readable violations. */
async function axeViolations(page: Page, include?: string): Promise<string[]> {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  return violations.map(
    (violation) => `${violation.id} (${violation.impact}): ${violation.help} — ${violation.nodes.map((node) => node.target.join(" ")).slice(0, 3).join(" | ")}`,
  );
}

/** Heading levels on the page, in document order (visible headings only). */
async function headingLevels(page: Page): Promise<number[]> {
  return page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((nodes) =>
    nodes.filter((node) => node.getClientRects().length > 0 && !node.closest("[aria-hidden=true]")).map((node) => Number(node.tagName[1])),
  );
}

test.describe("automated WCAG checks on every route", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`public ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await axeViolations(page)).toEqual([]);
    });
  }

  for (const path of APP_ROUTES) {
    test(`signed-in ${path}`, async ({ page }) => {
      await seedSignedIn(page);
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(main(page).locator("h1")).toBeVisible();
      expect(await axeViolations(page)).toEqual([]);
      const levels = await headingLevels(page);
      expect(levels[0], "first heading is the h1").toBe(1);
      for (let index = 1; index < levels.length; index += 1) {
        expect((levels[index] ?? 0) - (levels[index - 1] ?? 0), `heading jump at ${index} in ${levels.join(",")}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("interactive states", () => {
  test.beforeEach(async ({ page }) => {
    await seedSignedIn(page);
  });

  test("open dialogs are accessible, trap focus and restore it", async ({ page }) => {
    await page.goto("/wallet");
    await page.getByLabel("Amount to convert").fill("100");
    const trigger = page.getByRole("button", { name: "Review top-up" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Review your top-up" });
    await expect(dialog).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);

    for (let press = 0; press < 12; press += 1) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => Boolean(document.activeElement?.closest("dialog[open]")));
      expect(inside, `focus escaped the dialog after ${press + 1} Tab presses`).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("confirmation dialogs are accessible", async ({ page }) => {
    await page.goto("/account");
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("dialog", { name: "Sign out of the demo?" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("form errors are announced and tied to their fields", async ({ page }) => {
    await page.goto("/account/contact-support");
    await page.getByRole("button", { name: "Send message" }).click();
    const subject = page.getByLabel("Subject");
    await expect(subject).toHaveAttribute("aria-invalid", "true");
    const describedBy = (await subject.getAttribute("aria-describedby")) ?? "";
    expect(describedBy).toContain("subject-error");
    await expect(page.locator("#subject-error")).toHaveText("Add a short subject (at least 5 characters)");
    await expect(page.locator("#subject-error")).toHaveAttribute("aria-live", "polite");
    expect(await axeViolations(page)).toEqual([]);
  });

  test("skip link is first in tab order and moves focus to the content", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(main(page).locator("h1")).toBeVisible();
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("navigation marks the current page", async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), "sidebar is in the drawer on mobile; covered by the drawer test");
    await page.goto("/transactions");
    const nav = page.getByRole("navigation", { name: "Main" });
    if (await nav.isVisible()) await expect(nav.getByRole("link", { name: "Transactions" })).toHaveAttribute("aria-current", "page");
  });

  test("the mobile menu opens as an accessible drawer", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only control");
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    expect(await axeViolations(page)).toEqual([]);
    await drawer.getByRole("link", { name: "Analytics" }).click();
    await expect(page).toHaveURL("/analytics");
    await expect(drawer).toBeHidden();
  });

  test("segmented filters work with the keyboard", async ({ page }) => {
    await page.goto("/transactions");
    await page.getByRole("radio", { name: "All" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Payments & tips" })).toBeChecked();
  });
});

test.describe("reduced motion", () => {
  test("CSS transitions and animations collapse when the user prefers reduced motion", async ({ page }) => {
    await seedSignedIn(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dashboard");
    await expect(main(page).locator("h1")).toBeVisible();
    const durations = await page.evaluate(() => {
      const button = document.querySelector("main a, main button");
      return button ? getComputedStyle(button).transitionDuration : "missing";
    });
    expect(parseFloat(durations)).toBeLessThanOrEqual(0.001);
  });

  test("with motion allowed, transitions are present (control)", async ({ page }) => {
    await seedSignedIn(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/dashboard");
    await expect(main(page).locator("h1")).toBeVisible();
    const duration = await page.evaluate(() => getComputedStyle(document.querySelector("main a") ?? document.body).transitionDuration);
    expect(parseFloat(duration)).toBeGreaterThan(0.05);
  });
});
