import { describe, expect, it } from "vitest";
import { applyBasisPointsCeil, formatMoney, formatRwf, parseAmountToMinor, percentOfRwf, sumMoney } from "@/lib/money";

describe("parseAmountToMinor", () => {
  it("parses decimals into integer minor units without float error", () => {
    expect(parseAmountToMinor("10.29", "USD")).toBe(1029);
    expect(parseAmountToMinor("0.1", "USD")).toBe(10);
    expect(parseAmountToMinor("1,000.5", "EUR")).toBe(100050);
  });

  it("treats RWF as whole francs", () => {
    expect(parseAmountToMinor("18,500", "RWF")).toBe(18500);
    expect(parseAmountToMinor("18.5", "RWF")).toBeNull();
  });

  it("rejects invalid input", () => {
    for (const input of ["", "abc", "-5", "1.234", "1e3", "12.", ".5"]) {
      expect(parseAmountToMinor(input, "USD")).toBeNull();
    }
  });
});

describe("formatting", () => {
  it("formats with ISO code and correct precision", () => {
    expect(formatMoney({ amountMinor: 5000, currency: "USD" })).toBe("USD 50.00");
    expect(formatRwf(274000)).toBe("RWF 274,000");
  });

  it("signs values explicitly", () => {
    expect(formatRwf(-18500)).toBe("−RWF 18,500");
    expect(formatRwf(70000, true)).toBe("+RWF 70,000");
    expect(formatRwf(0, true)).toBe("RWF 0");
  });
});

describe("arithmetic", () => {
  it("rounds fees up so they are never under-charged", () => {
    expect(applyBasisPointsCeil(20000, 200)).toBe(400);
    expect(applyBasisPointsCeil(1001, 200)).toBe(21);
  });

  it("computes tip percentages in whole francs", () => {
    expect(percentOfRwf(24500, 10)).toBe(2450);
    expect(percentOfRwf(6500, 15)).toBe(975);
  });

  it("refuses to add different currencies", () => {
    expect(() => sumMoney([{ amountMinor: 1, currency: "USD" }, { amountMinor: 1, currency: "EUR" }], "USD")).toThrow();
    expect(sumMoney([{ amountMinor: 20000, currency: "USD" }, { amountMinor: 400, currency: "USD" }], "USD")).toEqual({ amountMinor: 20400, currency: "USD" });
  });
});
