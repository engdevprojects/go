import { describe, expect, it } from "vitest";
import { SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import { maskRwandanPhone, requiresStepUp, resolveTip } from "@/lib/payments";
import { parseQrPayload } from "@/lib/qr-payload";
import { safeInternalPath } from "@/lib/safe-redirect";
import { createInitialState, parsePersistedState } from "@/lib/store/persisted-state";
import { otpSchema, signInSchema } from "@/lib/validation/auth";
import { changePinSchema } from "@/lib/validation/account";
import { createTopUpSchema } from "@/lib/validation/money";
import { createMobileMoneySchema, normaliseRwandanPhone } from "@/lib/validation/services";

describe("parseQrPayload", () => {
  it("resolves a known merchant from the local directory", () => {
    const result = parseQrPayload("rvw-demo:pay?code=EK-100421");
    expect(result.ok && result.merchant.name).toBe("Ikawa Corner Café");
  });

  it("reads an optional suggested amount", () => {
    const result = parseQrPayload("rvw-demo:pay?code=EK-100433&amount=18000");
    expect(result.ok && result.suggestedAmountRwf).toBe(18000);
  });

  it("rejects untrusted or malformed content", () => {
    for (const raw of ["", "https://evil.example/pay", "rvw-demo:pay?code=EK-12", "rvw-demo:pay?code=EK-100421&amount=-5", "rvw-demo:refund?code=EK-100421", "rvw-demo:pay?code=EK-999999"]) {
      expect(parseQrPayload(raw).ok).toBe(false);
    }
  });

  it("never takes the merchant name from the QR", () => {
    const result = parseQrPayload("rvw-demo:pay?code=EK-100421&name=Fake%20Bank");
    expect(result.ok && result.merchant.name).toBe("Ikawa Corner Café");
  });
});

describe("payments", () => {
  it("resolves preset, custom and empty tips", () => {
    expect(resolveTip(24500, "10")).toEqual({ amountRwf: 2450, percent: 10 });
    expect(resolveTip(24500, "custom", "1,000")).toEqual({ amountRwf: 1000, percent: null });
    expect(resolveTip(24500, "custom", "abc")).toBeNull();
    expect(resolveTip(24500, "none")).toEqual({ amountRwf: 0, percent: null });
  });

  it("requires the step-up check only above USD 500", () => {
    expect(requiresStepUp(685_000, SAMPLE_RATE_BOARD)).toBe(false);
    expect(requiresStepUp(685_014, SAMPLE_RATE_BOARD)).toBe(true);
  });

  it("masks phone numbers", () => {
    expect(maskRwandanPhone("788124512")).toBe("+250 78• ••4 512");
  });
});

describe("validation", () => {
  it("validates sign-in email and OTP", () => {
    expect(signInSchema.safeParse({ email: " Name@Example.com " }).success).toBe(true);
    expect(signInSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(otpSchema.safeParse({ code: "123456" }).success).toBe(true);
    expect(otpSchema.safeParse({ code: "12345" }).success).toBe(false);
  });

  it("enforces the tier limit on top-ups", () => {
    const schema = createTopUpSchema("verified", SAMPLE_RATE_BOARD);
    expect(schema.safeParse({ currency: "USD", amount: "5000" }).success).toBe(true);
    expect(schema.safeParse({ currency: "USD", amount: "5000.01" }).success).toBe(false);
    expect(schema.safeParse({ currency: "USD", amount: "5" }).success).toBe(false);
    expect(createTopUpSchema("standard", SAMPLE_RATE_BOARD).safeParse({ currency: "USD", amount: "600" }).success).toBe(false);
  });

  it("normalises and validates Rwandan mobile numbers", () => {
    expect(normaliseRwandanPhone("+250 788 124 512")).toBe("788124512");
    expect(normaliseRwandanPhone("0788124512")).toBe("788124512");
    const schema = createMobileMoneySchema(10_000);
    expect(schema.safeParse({ phone: "0788124512", amount: "5000" }).success).toBe(true);
    expect(schema.safeParse({ phone: "0751234567", amount: "5000" }).success).toBe(false);
    expect(schema.safeParse({ phone: "0788124512", amount: "50000" }).success).toBe(false);
  });

  it("rejects weak or mismatched PINs", () => {
    expect(changePinSchema.safeParse({ currentPin: "482913", newPin: "583920", confirmPin: "583920" }).success).toBe(true);
    expect(changePinSchema.safeParse({ currentPin: "482913", newPin: "123456", confirmPin: "123456" }).success).toBe(false);
    expect(changePinSchema.safeParse({ currentPin: "482913", newPin: "111111", confirmPin: "111111" }).success).toBe(false);
    expect(changePinSchema.safeParse({ currentPin: "482913", newPin: "583920", confirmPin: "583921" }).success).toBe(false);
  });
});

describe("safeInternalPath", () => {
  it("allows only same-site paths", () => {
    expect(safeInternalPath("/wallet")).toBe("/wallet");
    expect(safeInternalPath("//evil.example")).toBe("/dashboard");
    expect(safeInternalPath("https://evil.example")).toBe("/dashboard");
    expect(safeInternalPath(undefined)).toBe("/dashboard");
  });
});

describe("persisted state", () => {
  it("round-trips the initial state", () => {
    const state = createInitialState();
    expect(parsePersistedState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  it("rejects corrupt or tampered data", () => {
    expect(parsePersistedState({ session: "x" })).toBeNull();
    const tampered = { ...createInitialState(), paymentMethods: [{ id: "a", brand: "visa", nickname: "x", last4: "4242424242424242", isDefault: true, addedAt: "" }] };
    expect(parsePersistedState(tampered)).toBeNull();
  });
});
