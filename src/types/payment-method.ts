/** Top-up methods named in UR-09. */
export type PaymentMethodBrand = "visa" | "mastercard" | "apple_pay" | "google_pay";

/**
 * A saved top-up method. Fictional and pre-masked: only a 4-digit suffix is
 * kept, never a full card number, expiry security code, or token.
 */
export interface PaymentMethod {
  id: string;
  brand: PaymentMethodBrand;
  nickname: string;
  last4: string;
  isDefault: boolean;
  addedAt: string;
}
