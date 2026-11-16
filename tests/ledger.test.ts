import { describe, expect, it } from "vitest";
import { computeAnalytics } from "@/lib/analytics";
import { DEMO_EPOCH_ISO } from "@/lib/dates";
import {
  buildReference,
  buildWalletSummary,
  computeBalanceRwf,
  DEFAULT_TRANSACTION_QUERY,
  groupByDay,
  queryTransactions,
  sortNewestFirst,
} from "@/lib/ledger";
import { DEMO_WALLET_ACCOUNT } from "@/lib/mock-data/profile";
import { SEED_TRANSACTIONS } from "@/lib/mock-data/transactions";

const NOW = new Date(DEMO_EPOCH_ISO);
const LEDGER = sortNewestFirst(SEED_TRANSACTIONS);

describe("seed data consistency", () => {
  it("reconciles to the documented balance", () => {
    expect(computeBalanceRwf(LEDGER)).toBe(205_985);
  });

  it("has unique ids and references", () => {
    expect(new Set(LEDGER.map((transaction) => transaction.id)).size).toBe(LEDGER.length);
    expect(new Set(LEDGER.map((transaction) => transaction.reference)).size).toBe(LEDGER.length);
  });

  it("uses only integer wallet amounts", () => {
    for (const transaction of LEDGER) expect(Number.isInteger(transaction.walletAmountRwf)).toBe(true);
  });
});

describe("buildWalletSummary", () => {
  it("derives days remaining and totals from the ledger", () => {
    const wallet = buildWalletSummary(DEMO_WALLET_ACCOUNT, LEDGER, NOW);
    expect(wallet.balanceRwf).toBe(205_985);
    expect(wallet.dayNumber).toBe(6);
    expect(wallet.daysRemaining).toBe(24);
    expect(wallet.dayNumber + wallet.daysRemaining).toBe(30);
    expect(wallet.status).toBe("active");
    expect(wallet.totalAddedRwf - wallet.totalSpentRwf).toBe(wallet.balanceRwf);
  });

  it("flags expiring wallets from the first reminder day", () => {
    const late = new Date("2027-05-01T08:00:00.000Z");
    expect(buildWalletSummary(DEMO_WALLET_ACCOUNT, LEDGER, late).status).toBe("expiring_soon");
  });
});

describe("queryTransactions", () => {
  it("searches by merchant and reference", () => {
    expect(queryTransactions(LEDGER, { ...DEFAULT_TRANSACTION_QUERY, search: "ikawa" })).toHaveLength(2);
    expect(queryTransactions(LEDGER, { ...DEFAULT_TRANSACTION_QUERY, search: "demo-0410-0015" })).toHaveLength(1);
  });

  it("filters by group and status", () => {
    expect(queryTransactions(LEDGER, { ...DEFAULT_TRANSACTION_QUERY, group: "top_ups" })).toHaveLength(2);
    expect(queryTransactions(LEDGER, { ...DEFAULT_TRANSACTION_QUERY, status: "failed" })).toHaveLength(1);
  });

  it("sorts by absolute amount", () => {
    const [largest] = queryTransactions(LEDGER, { ...DEFAULT_TRANSACTION_QUERY, sort: "amount_high" });
    expect(largest?.walletAmountRwf).toBe(274_000);
  });

  it("groups consecutive transactions by Kigali day", () => {
    const groups = groupByDay(LEDGER);
    expect(groups[0]?.dayKey).toBe("2027-04-11");
    expect(groups.reduce((count, group) => count + group.transactions.length, 0)).toBe(LEDGER.length);
  });
});

describe("computeAnalytics", () => {
  it("only counts completed, categorised wallet debits as spend", () => {
    const summary = computeAnalytics(LEDGER, "all", NOW);
    const expected = LEDGER.filter((t) => t.status === "completed" && t.walletAmountRwf < 0 && t.category).reduce((sum, t) => sum - t.walletAmountRwf, 0);
    expect(summary.totalSpentRwf).toBe(expected);
    expect(summary.totalSpentRwf).toBe(214_015);
    expect(summary.spendCount).toBe(12);
  });

  it("keeps daily and category totals consistent with the headline total", () => {
    const summary = computeAnalytics(LEDGER, "all", NOW);
    expect(summary.daily.reduce((sum, day) => sum + day.spentRwf, 0)).toBe(summary.totalSpentRwf);
    expect(summary.categories.reduce((sum, category) => sum + category.spentRwf, 0)).toBe(summary.totalSpentRwf);
    expect(summary.daily).toHaveLength(7);
  });

  it("keeps card charges separate per currency", () => {
    const summary = computeAnalytics(LEDGER, "all", NOW);
    expect(summary.cardChargesByCurrency).toEqual(
      expect.arrayContaining([
        { currency: "USD", amountMinor: 500 + 20_000 + 400 },
        { currency: "EUR", amountMinor: 10_000 + 200 },
      ]),
    );
  });

  it("returns empty spend for a window with no activity", () => {
    const summary = computeAnalytics(LEDGER, "7d", new Date("2027-06-01T08:00:00.000Z"));
    expect(summary.spendCount).toBe(0);
    expect(summary.topCategory).toBeNull();
  });
});

describe("buildReference", () => {
  it("uses the Kigali date and a padded sequence", () => {
    expect(buildReference(NOW, 18)).toBe("DEMO-0411-0018");
  });
});
