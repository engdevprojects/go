import { z } from "zod";
import { OTP_LENGTH } from "@/lib/config/product";

/**
 * Sign-in identifier. UR-01 specifies email + device passkey with no
 * password, so the demo asks for an email only.
 */
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .max(254, "That email address is too long")
    .pipe(z.email({ error: "Enter a valid email address, like name@example.com" })),
});
export type SignInValues = z.infer<typeof signInSchema>;

/** Six-digit email code (UR-01). */
export const otpSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter all ${OTP_LENGTH} digits of the code`),
});
export type OtpValues = z.infer<typeof otpSchema>;
