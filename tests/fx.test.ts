import { describe, expect, it } from "vitest";
import { buildConvertBackQuote, buildTopUpQuote, foreignToRwf, formatRate, rwfToForeign, toUsdMinor } from "@/lib/fx";
import { SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";

const NOW = new Date("2027-04-11T08:00:00.000Z");

describe("conversion", () => {
  it("converts foreign minor units to whole francs, rounding down", () => {
    expect(foreignToRwf(20000, "USD", 1_370_000)).toBe(274000);
    expect(foreignToRwf(10000, "EUR", 1_510_000)).toBe(151000);
    expect(foreignToRwf(1, "USD", 1_370_000)).toBe(13);
  });

  it("converts francs back to foreign minor units, rounding down", () => {
    expect(rwfToForeign(274000, "USD", 1_370_000)).toBe(20000);
    expect(rwfToForeign(205985, "USD", 1_370_000)).toBe(15035);
  });

  it("expresses other currencies in USD via the cross rate for limit checks", () => {
    expect(toUsdMinor(10000, "EUR", SAMPLE_RATE_BOARD)).toBe(11021);
    expect(toUsdMinor(500, "USD", SAMPLE_RATE_BOARD)).toBe(500);
  });

  it("formats rates for display", () => {
    expect(formatRate("USD", 1_370_000)).toBe("1 USD = 1,370.00 RWF");
  });
});

describe("buildTopUpQuote", () => {
  it("shows amount, 2% fee, total and francs received (UR-10)", () => {
    const quote = buildTopUpQuote(20000, "USD", SAMPLE_RATE_BOARD, NOW);
    expect(quote.fee).toEqual({ amountMinor: 400, currency: "USD" });
    expect(quote.totalCharged).toEqual({ amountMinor: 20400, currency: "USD" });
    expect(quote.receiveRwf).toBe(274000);
  });

  it("locks the rate for 10 minutes", () => {
    const quote = buildTopUpQuote(20000, "USD", SAMPLE_RATE_BOARD, NOW);
    expect(Date.parse(quote.expiresAt) - NOW.getTime()).toBe(10 * 60_000);
  });
});

describe("buildConvertBackQuote", () => {
  it("deducts USD 3 from the converted amount (UR-22)", () => {
    const quote = buildConvertBackQuote(137000, "USD", SAMPLE_RATE_BOARD, NOW);
    expect(quote.grossReturn.amountMinor).toBe(10000);
    expect(quote.deduction.amountMinor).toBe(300);
    expect(quote.netReturn.amountMinor).toBe(9700);
  });

  it("expresses the deduction in the card currency and never goes negative", () => {
    const quote = buildConvertBackQuote(1000, "GBP", SAMPLE_RATE_BOARD, NOW);
    expect(quote.deduction.currency).toBe("GBP");
    expect(quote.deduction.amountMinor).toBe(236);
    expect(quote.netReturn.amountMinor).toBe(0);
  });
});
