import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DEMO_OTP_CODE } from "@/lib/config/product";
import { affectsBalance, buildWalletSummary, computeBalanceRwf } from "@/lib/ledger";
import { DEMO_MERCHANTS } from "@/lib/mock-data/directory";
import { DEMO_WALLET_ACCOUNT } from "@/lib/mock-data/profile";
import { SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import { SEED_TRANSACTIONS } from "@/lib/mock-data/transactions";
import { parseQrPayload } from "@/lib/qr-payload";
import { createInitialState, parsePersistedState } from "@/lib/store/persisted-state";
import type { Transaction } from "@/types/transaction";

const SRC = fileURLToPath(new URL("../src", import.meta.url));

/** Every .ts/.tsx source file under src/. */
function sourceFiles(dir = SRC): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? sourceFiles(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("QR payloads are untrusted input", () => {
  it.each([
    ["scientific notation", "rvw-demo:pay?code=EK-100421&amount=1e4"],
    ["hex", "rvw-demo:pay?code=EK-100421&amount=0x2710"],
    ["padded", "rvw-demo:pay?code=EK-100421&amount=%205000"],
    ["decimal", "rvw-demo:pay?code=EK-100421&amount=5000.5"],
    ["negative", "rvw-demo:pay?code=EK-100421&amount=-5000"],
    ["too small", "rvw-demo:pay?code=EK-100421&amount=50"],
    ["too large", "rvw-demo:pay?code=EK-100421&amount=99999999"],
    ["non-ASCII digits", "rvw-demo:pay?code=EK-١٠٠٤٢١"],
    ["javascript URL", "javascript:alert(1)"],
    ["real-looking EMV payload", "00020101021229300012D156000000000510A93FO3230Q"],
    ["https link", "https://pay.example/EK-100421"],
    ["wrong action", "rvw-demo:refund?code=EK-100421"],
    ["unknown merchant", "rvw-demo:pay?code=EK-000000"],
    ["oversized", `rvw-demo:pay?code=EK-100421&x=${"a".repeat(300)}`],
  ])("rejects %s", (_label, payload) => {
    expect(parseQrPayload(payload).ok).toBe(false);
  });

  it("accepts a plain whole-franc suggestion", () => {
    const result = parseQrPayload("rvw-demo:pay?code=EK-100421&amount=6500");
    expect(result.ok && result.suggestedAmountRwf).toBe(6500);
  });

  it("only ever returns merchants from the local directory", () => {
    for (const merchant of DEMO_MERCHANTS) {
      const result = parseQrPayload(`rvw-demo:pay?code=${merchant.code}&name=Attacker%20Ltd`);
      expect(result.ok && result.merchant).toBe(merchant);
    }
  });
});

describe("balance rules for non-completed transactions", () => {
  const base: Transaction = {
    id: "t",
    reference: "DEMO-0101-0001",
    type: "payment",
    status: "completed",
    title: "x",
    category: "food_dining",
    walletAmountRwf: -10_000,
    createdAt: "2027-04-10T10:00:00.000Z",
    origin: "session",
  };

  it("never lets failed or reversed transactions change the balance", () => {
    expect(affectsBalance({ ...base, status: "failed" })).toBe(false);
    expect(affectsBalance({ ...base, status: "reversed" })).toBe(false);
    expect(computeBalanceRwf([...SEED_TRANSACTIONS, { ...base, status: "failed" }, { ...base, id: "u", status: "reversed" }])).toBe(205_985);
  });

  it("reserves pending debits but does not credit pending top-ups", () => {
    expect(affectsBalance({ ...base, status: "pending" })).toBe(true);
    expect(affectsBalance({ ...base, status: "pending", type: "top_up", walletAmountRwf: 50_000 })).toBe(false);
  });

  it("keeps added minus spent equal to the balance", () => {
    const wallet = buildWalletSummary(DEMO_WALLET_ACCOUNT, [...SEED_TRANSACTIONS, { ...base, status: "reversed" }], new Date("2027-04-11T08:00:00.000Z"));
    expect(wallet.totalAddedRwf - wallet.totalSpentRwf).toBe(wallet.balanceRwf);
  });
});

describe("demo safety", () => {
  it("labels every sample rate and seed transaction as demo data", () => {
    expect(SAMPLE_RATE_BOARD.sourceLabel.toLowerCase()).toContain("sample");
    for (const transaction of SEED_TRANSACTIONS) {
      expect(transaction.reference.startsWith("DEMO-")).toBe(true);
      expect(transaction.origin).toBe("seed");
    }
  });

  it("never persists the OTP, PINs or card numbers", () => {
    const serialized = JSON.stringify(createInitialState());
    expect(serialized).not.toContain(DEMO_OTP_CODE);
    expect(serialized).not.toMatch(/\d{12,19}/);
    const withPin = { ...createInitialState(), pin: "482913" };
    expect(parsePersistedState(withPin)).not.toHaveProperty("pin");
  });

  it("contains no copy that implies a live service or invented endorsement", () => {
    // Affirmative claims only — disclaimers such as "not live or guaranteed rates" are expected and allowed.
    const banned = [/real service/i, /popular choice/i, /rates? (is|are) guaranteed/i, /\blive (exchange )?rates? (is|are) shown/i, /licensed by/i, /regulated by/i, /instant(ly)? credited/i];
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const text = readFileSync(file, "utf8");
      for (const pattern of banned) if (pattern.test(text)) offenders.push(`${file.replace(SRC, "src")}: ${pattern}`);
    }
    expect(offenders).toEqual([]);
  });

  it("uses the GO name everywhere (the old name only appears when citing the requirements document)", () => {
    const offenders = sourceFiles().filter((file) => /Rwanda Visitor Wallet(?! and Visitor Data)/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("never sends anything over the network from application code", () => {
    const offenders = sourceFiles().filter((file) => /\bfetch\(|XMLHttpRequest|navigator\.sendBeacon|new WebSocket/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
