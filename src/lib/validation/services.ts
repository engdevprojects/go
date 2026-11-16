import { z } from "zod";
import { MOBILE_MONEY_PROVIDERS } from "@/lib/mock-data/directory";
import { createRwfAmountSchema } from "@/lib/validation/money";

/** Normalises a typed Rwandan mobile number to its 9 national digits (no +250 / leading 0). */
export function normaliseRwandanPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("250") && digits.length === 12) return digits.slice(3);
  if (digits.startsWith("0") && digits.length === 10) return digits.slice(1);
  return digits;
}

const ALL_PREFIXES = MOBILE_MONEY_PROVIDERS.flatMap((provider) => provider.prefixes);

/**
 * Mobile Money send form (UR-15). The provider is inferred from the prefix so
 * a visitor can't send to a number on the wrong network.
 */
export function createMobileMoneySchema(balanceRwf: number) {
  return z.object({
    phone: z
      .string()
      .trim()
      .min(1, "Enter the recipient's mobile number")
      .refine((value) => /^7\d{8}$/.test(normaliseRwandanPhone(value)), "Enter a Rwandan mobile number, e.g. 078 812 4512")
      .refine(
        (value) => ALL_PREFIXES.includes(normaliseRwandanPhone(value).slice(0, 2)),
        "That number isn't on MTN MoMo or Airtel Money",
      ),
    amount: createRwfAmountSchema(balanceRwf),
    note: z.string().trim().max(80, "Keep the note under 80 characters").optional(),
  });
}
export type MobileMoneyValues = z.infer<ReturnType<typeof createMobileMoneySchema>>;

/** Manual merchant-code entry on Pay & Tip. */
export const merchantCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^EK-\d{6}$/, "Merchant codes look like EK-123456"),
});
export type MerchantCodeValues = z.infer<typeof merchantCodeSchema>;

/** Payment amount + tip (UR-14, UR-16). Custom tip is whole francs. */
export function createPaymentSchema(balanceRwf: number) {
  return z.object({
    amount: createRwfAmountSchema(balanceRwf),
    tipChoice: z.enum(["none", "5", "10", "15", "custom"]),
    customTip: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^\d+$/.test(value.replace(/[,\s]/g, "")), "Enter whole francs, numbers only"),
  });
}
export type PaymentValues = z.infer<ReturnType<typeof createPaymentSchema>>;
