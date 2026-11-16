import { z } from "zod";
import { DEMO_MERCHANTS } from "@/lib/mock-data/directory";
import type { DemoMerchant } from "@/types/service";

/**
 * Demo QR payload format (documented in the README):
 *
 *   rvw-demo:pay?code=EK-100421            — merchant, visitor enters amount
 *   rvw-demo:pay?code=EK-100421&amount=6500 — merchant with a suggested amount
 *
 * Real eKash QR decoding is a partner integration (INT-03) and is out of
 * scope. QR content is untrusted: it is parsed against a strict schema, and
 * the merchant name always comes from the local directory lookup — never from
 * the QR itself.
 */
export const DEMO_QR_SCHEME = "rvw-demo:";
const MAX_PAYLOAD_LENGTH = 200;

const payloadSchema = z.object({
  code: z.string().regex(/^EK-\d{6}$/, "Merchant code must look like EK-123456"),
  // Plain digits only: rejects "1e4", "0x10", " 5000", "5000.5" that numeric coercion would accept.
  amount: z
    .string()
    .regex(/^\d{1,7}$/, "The amount in this code isn't valid")
    .transform(Number)
    .pipe(z.number().int().min(100, "The amount in this code isn't valid").max(5_000_000, "The amount in this code isn't valid"))
    .optional(),
});

/** Result of reading a scanned or pasted payload. */
export type QrParseResult =
  | { ok: true; merchant: DemoMerchant; suggestedAmountRwf: number | null }
  | { ok: false; reason: string };

/** Sample payloads offered as a test path when no camera is available. */
export const SAMPLE_QR_PAYLOADS: readonly { label: string; payload: string }[] = [
  { label: "Ikawa Corner Café", payload: "rvw-demo:pay?code=EK-100421" },
  { label: "Umuganura Grill · RWF 18,000", payload: "rvw-demo:pay?code=EK-100433&amount=18000" },
  { label: "Unknown merchant (fails lookup)", payload: "rvw-demo:pay?code=EK-999999" },
];

/**
 * Parses and validates QR content, then resolves the merchant locally.
 * @param raw Text decoded from a QR code or pasted by the visitor.
 */
export function parseQrPayload(raw: string): QrParseResult {
  const text = raw.trim();
  if (text.length === 0) return { ok: false, reason: "The code is empty." };
  if (text.length > MAX_PAYLOAD_LENGTH) return { ok: false, reason: "This code is too long to be a demo payment code." };
  if (!text.startsWith(DEMO_QR_SCHEME)) {
    return { ok: false, reason: "This isn't a demo merchant code. Real eKash QR codes can't be paid from this demo." };
  }

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { ok: false, reason: "The code couldn't be read." };
  }
  if (url.pathname !== "pay") return { ok: false, reason: "Only payment codes are supported." };

  const parsed = payloadSchema.safeParse({
    code: url.searchParams.get("code") ?? "",
    amount: url.searchParams.get("amount") ?? undefined,
  });
  if (!parsed.success) return { ok: false, reason: parsed.error.issues[0]?.message ?? "The code is not valid." };

  const merchant = DEMO_MERCHANTS.find((candidate) => candidate.code === parsed.data.code);
  if (!merchant) return { ok: false, reason: `No merchant ${parsed.data.code} in the demo directory. Nothing was charged.` };

  return { ok: true, merchant, suggestedAmountRwf: parsed.data.amount ?? null };
}
