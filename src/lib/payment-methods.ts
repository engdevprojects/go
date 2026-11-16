import type { PaymentMethod, PaymentMethodBrand } from "@/types/payment-method";

/** Display names for top-up methods. */
export const PAYMENT_BRAND_LABELS: Record<PaymentMethodBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
};

/**
 * Generates a fictional 4-digit suffix for a demo method that doesn't clash
 * with existing ones. Deterministic from the count so tests are stable; never
 * derived from anything the visitor typed.
 * @param existing Methods already saved.
 */
export function fictionalLast4(existing: readonly PaymentMethod[]): string {
  const taken = new Set(existing.map((method) => method.last4));
  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const candidate = String((1_000 + (existing.length + attempt) * 7_919) % 10_000).padStart(4, "0");
    if (!taken.has(candidate)) return candidate;
  }
  return "0000";
}

/** "Visa •••• 4242" */
export function describeMethod(method: Pick<PaymentMethod, "brand" | "last4">): string {
  return `${PAYMENT_BRAND_LABELS[method.brand]} •••• ${method.last4}`;
}
