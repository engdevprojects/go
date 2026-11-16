import { z } from "zod";
import { TIER_LIMITS } from "@/lib/config/product";
import { toUsdMinor } from "@/lib/fx";
import { formatMoney, formatRwf, formatUsd, parseAmountToMinor } from "@/lib/money";
import type { ExchangeRateBoard } from "@/types/exchange";
import type { WalletTier } from "@/types/wallet";

/**
 * Schemas for amount entry. Amounts are typed as strings (what the input
 * holds) and validated by parsing to integer minor units — never floats.
 */

/** Smallest card top-up the demo accepts, in minor units of any card currency. */
export const MIN_TOP_UP_MINOR = 1_000;
/** Smallest wallet payment or transfer in RWF. */
export const MIN_PAYMENT_RWF = 100;

const foreignCurrency = z.enum(["USD", "EUR", "GBP"]);

/**
 * Top-up form: card currency + amount, checked against the tier's
 * per-conversion limit (UR-06, UR-07, UR-13), which is stated in USD.
 * @param tier Wallet tier whose limit applies.
 * @param board Sample rates used to express the amount in USD.
 */
export function createTopUpSchema(tier: WalletTier, board: ExchangeRateBoard) {
  const limitUsdMinor = TIER_LIMITS[tier].perConversionUsdMinor;
  return z
    .object({
      currency: foreignCurrency,
      amount: z.string().trim().min(1, "Enter an amount"),
    })
    .superRefine((values, context) => {
      const minor = parseAmountToMinor(values.amount, values.currency);
      if (minor === null) {
        context.addIssue({ code: "custom", path: ["amount"], message: "Use numbers only, with up to 2 decimal places" });
        return;
      }
      if (minor < MIN_TOP_UP_MINOR) {
        context.addIssue({
          code: "custom",
          path: ["amount"],
          message: `The minimum is ${formatMoney({ amountMinor: MIN_TOP_UP_MINOR, currency: values.currency })}`,
        });
        return;
      }
      if (toUsdMinor(minor, values.currency, board) > limitUsdMinor) {
        context.addIssue({
          code: "custom",
          path: ["amount"],
          message: `The ${TIER_LIMITS[tier].label} tier limit is ${formatUsd(limitUsdMinor)} per conversion`,
        });
      }
    });
}
export type TopUpValues = z.infer<ReturnType<typeof createTopUpSchema>>;

/**
 * Builds a whole-franc amount schema bounded by the available balance.
 * Used by payments, transfers and convert-back estimates.
 * @param balanceRwf Available balance.
 * @param label Noun used in the "Enter an …" message.
 */
export function createRwfAmountSchema(balanceRwf: number, label = "amount") {
  return z
    .string()
    .trim()
    .min(1, `Enter an ${label} in RWF`)
    .superRefine((value, context) => {
      const rwf = parseAmountToMinor(value, "RWF");
      if (rwf === null) context.addIssue({ code: "custom", message: "Enter whole francs, numbers only" });
      else if (rwf < MIN_PAYMENT_RWF) context.addIssue({ code: "custom", message: `The minimum is ${formatRwf(MIN_PAYMENT_RWF)}` });
      else if (rwf > balanceRwf) context.addIssue({ code: "custom", message: `That's more than your available ${formatRwf(balanceRwf)}` });
    });
}

/**
 * Convert-back estimate form: card currency + whole francs up to the balance.
 * @param balanceRwf Available balance.
 */
export function createConvertBackSchema(balanceRwf: number) {
  return z.object({ currency: foreignCurrency, amount: createRwfAmountSchema(balanceRwf) });
}
export type ConvertBackValues = z.infer<ReturnType<typeof createConvertBackSchema>>;
