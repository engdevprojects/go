import { z } from "zod";
import { COUNTRY_OPTIONS } from "@/lib/mock-data/profile";

const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}' .-]*$/u;

/** Editable, non-sensitive profile fields. */
export const profileSchema = z.object({
  givenName: z.string().trim().min(1, "Enter your first name").max(50, "Use 50 characters or fewer").regex(NAME_PATTERN, "Use letters, spaces, hyphens or apostrophes"),
  familyName: z.string().trim().min(1, "Enter your last name").max(50, "Use 50 characters or fewer").regex(NAME_PATTERN, "Use letters, spaces, hyphens or apostrophes"),
  countryCode: z.string().refine((code) => COUNTRY_OPTIONS.some((country) => country.code === code), "Choose a country"),
});
export type ProfileValues = z.infer<typeof profileSchema>;

/** Rejects PINs like 111111 or 123456 that are trivially guessable. */
function isWeakPin(pin: string): boolean {
  if (/^(\d)\1+$/.test(pin)) return true;
  const ascending = "01234567890";
  const descending = "09876543210";
  return ascending.includes(pin) || descending.includes(pin);
}

const pinField = z.string().regex(/^\d{6}$/, "Your app PIN is 6 digits");

/**
 * Demo app-PIN change (UR-17 mentions an app PIN). Values are validated in
 * memory and discarded — never stored or sent anywhere.
 */
export const changePinSchema = z
  .object({
    currentPin: pinField,
    newPin: pinField.refine((pin) => !isWeakPin(pin), "Avoid repeated or sequential digits"),
    confirmPin: z.string(),
  })
  .refine((values) => values.newPin === values.confirmPin, { path: ["confirmPin"], message: "The PINs don't match" })
  .refine((values) => values.newPin !== values.currentPin, { path: ["newPin"], message: "Choose a PIN different from your current one" });
export type ChangePinValues = z.infer<typeof changePinSchema>;

/** Demo Premium application (UR-07): source of funds + VIP/hospitality ticket. */
export const premiumApplicationSchema = z.object({
  sourceOfFunds: z.enum(["Employment income", "Savings", "Business income", "Other"], { error: "Choose your main source of funds" }),
  hasTicket: z.boolean().refine((value) => value, "Premium needs a VIP or hospitality ticket"),
});
export type PremiumApplicationValues = z.infer<typeof premiumApplicationSchema>;

/**
 * Adding a demo top-up method. Only a brand and nickname are collected; the
 * demo generates a fictional suffix. No card number, expiry or CVV is asked for.
 */
export const paymentMethodSchema = z.object({
  brand: z.enum(["visa", "mastercard", "apple_pay", "google_pay"], { error: "Choose a method" }),
  nickname: z.string().trim().min(2, "Give it a name you'll recognise").max(30, "Use 30 characters or fewer"),
});
export type PaymentMethodValues = z.infer<typeof paymentMethodSchema>;
