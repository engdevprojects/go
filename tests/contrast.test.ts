import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guards WCAG AA contrast (4.5:1 for normal text) for the text/background
 * token pairs the components actually use, reading values from globals.css.
 */
const css = readFileSync(fileURLToPath(new URL("../src/app/globals.css", import.meta.url)), "utf8");

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match?.[1]) throw new Error(`Missing token ${name}`);
  return match[1];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const value = parseInt(hex.slice(i, i + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(foreground: string, background: string): number {
  const [light, dark] = [luminance(token(foreground)), luminance(token(background))].sort((a, b) => b - a);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

const PAIRS: [string, string][] = [
  ["ink", "canvas"],
  ["ink-muted", "surface"],
  ["ink-muted", "canvas"],
  ["ink-muted", "surface-muted"],
  ["ink-subtle", "surface"],
  ["ink-subtle", "canvas"],
  ["ink-subtle", "surface-muted"],
  ["brand", "surface"],
  ["brand-strong", "brand-soft"],
  ["accent-strong", "surface"],
  ["accent-strong", "accent-soft"],
  ["success", "surface"],
  ["success", "success-soft"],
  ["warning", "warning-soft"],
  ["danger", "surface"],
  ["danger", "danger-soft"],
  ["info", "info-soft"],
  ["ink-inverse", "brand"],
  ["ink-inverse", "brand-navy"],
  ["ink-inverse", "danger"],
];

describe("design token contrast", () => {
  it.each(PAIRS)("%s on %s meets 4.5:1", (foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
