import type { Page } from "@playwright/test";
import { expect, main, readState, seedSignedIn, test } from "./fixtures";

/** How the fake camera should behave for a test. */
interface CameraMock {
  /** "grant" returns a canvas stream; otherwise getUserMedia rejects with this DOMException name. */
  permission: "grant" | "NotAllowedError" | "NotFoundError" | "AbortError";
  /** Install a fake BarcodeDetector; false simulates an unsupported browser. */
  detector: boolean;
  /** Value the detector reports on its first successful detection; null never detects. */
  qrValue: string | null;
  /** Delay before getUserMedia settles (simulates a slow permission prompt). */
  delayMs: number;
}

/**
 * Replaces the camera APIs with deterministic fakes. The fake stream is a
 * real MediaStream from a canvas; every track's stop() increments
 * window.__stoppedTracks so cleanup can be asserted.
 */
async function mockCamera(page: Page, mock: CameraMock): Promise<void> {
  await page.addInitScript((config: CameraMock) => {
    const w = window;
    w.__stoppedTracks = 0;
    w.__gumCalls = 0;
    const getUserMedia = async (): Promise<MediaStream> => {
      w.__gumCalls = (w.__gumCalls ?? 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, config.delayMs));
      if (config.permission !== "grant") throw new DOMException("mock", config.permission);
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      canvas.getContext("2d")?.fillRect(0, 0, 64, 64);
      const stream = canvas.captureStream(10);
      for (const track of stream.getTracks()) {
        const original = track.stop.bind(track);
        track.stop = () => {
          w.__stoppedTracks = (w.__stoppedTracks ?? 0) + 1;
          original();
        };
      }
      return stream;
    };
    Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia }, configurable: true });
    if (config.detector) {
      class FakeDetector {
        async detect(): Promise<{ rawValue: string; format: string }[]> {
          return config.qrValue ? [{ rawValue: config.qrValue, format: "qr_code" }] : [];
        }
        static async getSupportedFormats(): Promise<string[]> {
          return ["qr_code"];
        }
      }
      Object.defineProperty(window, "BarcodeDetector", { value: FakeDetector, configurable: true });
    } else {
      Object.defineProperty(window, "BarcodeDetector", { value: undefined, configurable: true });
    }
  }, mock);
}

const stoppedTracks = (page: Page) => page.evaluate(() => window.__stoppedTracks ?? 0);
const cameraRequests = (page: Page) => page.evaluate(() => window.__gumCalls ?? 0);
const allowCamera = (page: Page) => page.getByRole("button", { name: "Allow camera and scan" }).click();
const BASE: CameraMock = { permission: "grant", detector: true, qrValue: null, delayMs: 0 };

test.beforeEach(async ({ page }) => {
  await seedSignedIn(page);
});

test.describe("camera QR scanning", () => {
  test("explains the camera use before asking for permission", async ({ page }) => {
    await mockCamera(page, BASE);
    await page.goto("/services/pay-tip");
    await expect(main(page).getByText(/only use the camera to read a QR code/)).toBeVisible();
    expect(await cameraRequests(page)).toBe(0);
  });

  test("a decoded demo code resolves the merchant and turns the camera off", async ({ page }) => {
    await mockCamera(page, { ...BASE, qrValue: "rvw-demo:pay?code=EK-100421&amount=6500" });
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await expect(page.getByRole("heading", { name: "Ikawa Corner Café" })).toBeVisible();
    await expect(page.getByLabel("Amount")).toHaveValue("6500");
    expect(await stoppedTracks(page)).toBeGreaterThan(0);
    const state = await readState(page);
    expect(state?.sessionTransactions).toEqual([]);
  });

  test("untrusted QR content cannot start a payment", async ({ page }) => {
    await mockCamera(page, { ...BASE, qrValue: "https://pay.example/send?to=attacker&amount=500000" });
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await expect(page.getByRole("alert").filter({ hasText: "That code can't be paid" })).toContainText("isn't a demo merchant code");
    await expect(page.getByRole("button", { name: "Review payment" })).toHaveCount(0);
    expect((await readState(page))?.sessionTransactions).toEqual([]);
    expect(await stoppedTracks(page)).toBeGreaterThan(0);
  });

  test("a demo-format code with a tampered amount is rejected", async ({ page }) => {
    await mockCamera(page, { ...BASE, qrValue: "rvw-demo:pay?code=EK-100421&amount=1e9" });
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await expect(page.getByRole("alert").filter({ hasText: "That code can't be paid" })).toBeVisible();
  });

  test("permission denied shows recovery guidance", async ({ page }) => {
    await mockCamera(page, { ...BASE, permission: "NotAllowedError" });
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await expect(main(page).getByText("Camera access was blocked")).toBeVisible();
    await expect(main(page).getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("no camera hardware is reported clearly", async ({ page }) => {
    await mockCamera(page, { ...BASE, permission: "NotFoundError" });
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await expect(main(page).getByText("No camera was found on this device.")).toBeVisible();
  });

  test("other camera errors offer a retry", async ({ page }) => {
    await mockCamera(page, { ...BASE, permission: "AbortError" });
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await expect(main(page).getByText("The camera couldn't start")).toBeVisible();
  });

  test("browsers without BarcodeDetector get the manual path and never open the camera", async ({ page }) => {
    await mockCamera(page, { ...BASE, detector: false });
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await expect(main(page).getByText(/can't decode QR codes from the camera/)).toBeVisible();
    expect(await cameraRequests(page)).toBe(0);
    await expect(page.getByLabel("Merchant code")).toBeVisible();
  });

  test("stopping the scan releases the camera", async ({ page }) => {
    await mockCamera(page, BASE);
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await page.getByRole("button", { name: "Stop camera" }).click();
    expect(await stoppedTracks(page)).toBeGreaterThan(0);
  });

  test("navigating away mid-scan releases the camera", async ({ page }) => {
    await mockCamera(page, BASE);
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await expect(main(page).getByText("Scanning… hold steady.")).toBeVisible();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/dashboard");
    expect(await stoppedTracks(page)).toBeGreaterThan(0);
  });

  test("leaving while the permission prompt is open never leaves the camera on", async ({ page }) => {
    await mockCamera(page, { ...BASE, delayMs: 1_500 });
    await page.goto("/services/pay-tip");
    await allowCamera(page);
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/dashboard");
    await expect.poll(() => stoppedTracks(page), { timeout: 5_000 }).toBeGreaterThan(0);
  });
});
