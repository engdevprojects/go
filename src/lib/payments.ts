import { HIGH_VALUE_PAYMENT_USD_MINOR } from "@/lib/config/product";
import { getRateMilli, rwfToForeign } from "@/lib/fx";
import { parseAmountToMinor, percentOfRwf } from "@/lib/money";
import type { ExchangeRateBoard } from "@/types/exchange";

/** Tip choices offered on Pay & Tip (UR-16). */
export type TipChoice = "none" | "5" | "10" | "15" | "custom";

/** A resolved tip: whole francs and the preset percent (null when custom). */
export interface ResolvedTip {
  amountRwf: number;
  percent: number | null;
}

/**
 * Resolves the tip for a payment amount.
 * @param amountRwf Payment amount in whole francs.
 * @param choice Preset percentage, custom, or none.
 * @param customTip Raw custom tip text (used only when `choice` is "custom").
 * @returns The tip, or null when a custom tip is not a valid whole-franc number.
 */
export function resolveTip(amountRwf: number, choice: TipChoice, customTip?: string): ResolvedTip | null {
  if (choice === "none") return { amountRwf: 0, percent: null };
  if (choice === "custom") {
    if (!customTip || customTip.trim() === "") return { amountRwf: 0, percent: null };
    const value = parseAmountToMinor(customTip, "RWF");
    return value === null ? null : { amountRwf: value, percent: null };
  }
  const percent = Number(choice);
  return { amountRwf: percentOfRwf(amountRwf, percent), percent };
}

/**
 * Whether a payment total needs the extra email-code step (UR-17: above
 * USD 500 equivalent), using the shared sample USD rate.
 */
export function requiresStepUp(totalRwf: number, board: ExchangeRateBoard): boolean {
  return rwfToForeign(totalRwf, "USD", getRateMilli(board, "USD")) > HIGH_VALUE_PAYMENT_USD_MINOR;
}

/**
 * Masks a 9-digit Rwandan national number for display, e.g.
 * "788124512" → "+250 78• ••4 512".
 */
export function maskRwandanPhone(nationalNumber: string): string {
  const digits = nationalNumber.replace(/\D/g, "");
  if (digits.length !== 9) return "+250 •••";
  return `+250 ${digits.slice(0, 2)}• ••${digits.slice(5, 6)} ${digits.slice(6)}`;
}
