"use client";

import { ListFilter, SearchX } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { TransactionRow } from "@/components/finance/transaction-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { SearchInput, Select } from "@/components/ui/form-controls";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { formatDate, formatWeekday, kigaliDayKey } from "@/lib/dates";
import {
  affectsBalance,
  DEFAULT_TRANSACTION_QUERY,
  groupByDay,
  queryTransactions,
  TRANSACTION_GROUP_FILTERS,
  type TransactionGroupFilter,
  type TransactionQuery,
  type TransactionSort,
  type TransactionStatusFilter,
} from "@/lib/ledger";
import { formatRwf } from "@/lib/money";
import { useDemoStore } from "@/lib/store/demo-store";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: TransactionStatusFilter; label: string }[] = [
  { value: "all", label: "Any status" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "reversed", label: "Reversed" },
];

const SORT_OPTIONS: { value: TransactionSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount_high", label: "Largest amount" },
  { value: "amount_low", label: "Smallest amount" },
];

function isStatus(value: string): value is TransactionStatusFilter {
  return STATUS_OPTIONS.some((option) => option.value === value);
}
function isSort(value: string): value is TransactionSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

/**
 * Searchable, filterable transaction history. Date sorts are grouped by
 * Kigali calendar day; amount sorts show a flat list with dates inline.
 * @param initialGroup Optional filter from the URL (e.g. `?group=top_ups`).
 */
export function TransactionExplorer({ initialGroup }: { initialGroup: TransactionGroupFilter }) {
  const { transactions, now } = useDemoStore();
  const [query, setQuery] = useState<TransactionQuery>({ ...DEFAULT_TRANSACTION_QUERY, group: initialGroup });
  const [visible, setVisible] = useState(PAGE_SIZE);
  const deferredSearch = useDeferredValue(query.search);

  const results = useMemo(
    () => queryTransactions(transactions, { ...query, search: deferredSearch }),
    [transactions, query, deferredSearch],
  );
  const shown = results.slice(0, visible);
  const dateSorted = query.sort === "newest" || query.sort === "oldest";
  const groups = dateSorted ? groupByDay(shown) : [];

  const totals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const transaction of results) {
      if (!affectsBalance(transaction)) continue;
      if (transaction.walletAmountRwf > 0) inflow += transaction.walletAmountRwf;
      else outflow -= transaction.walletAmountRwf;
    }
    return { inflow, outflow };
  }, [results]);

  function update(patch: Partial<TransactionQuery>) {
    setQuery((current) => ({ ...current, ...patch }));
    setVisible(PAGE_SIZE);
  }

  const filtersActive = query.search !== "" || query.group !== "all" || query.status !== "all";
  const todayKey = kigaliDayKey(now);

  return (
    <div className="space-y-6">
      <Card padding="md" className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <SearchInput
            id="transaction-search"
            label="Search transactions"
            placeholder="Search by merchant, person or reference"
            value={query.search}
            onChange={(event) => update({ search: event.target.value })}
          />
          <div>
            <label htmlFor="transaction-status" className="sr-only">
              Status
            </label>
            <Select
              id="transaction-status"
              value={query.status}
              onChange={(event) => {
                if (isStatus(event.target.value)) update({ status: event.target.value });
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="transaction-sort" className="sr-only">
              Sort
            </label>
            <Select
              id="transaction-sort"
              value={query.sort}
              onChange={(event) => {
                if (isSort(event.target.value)) update({ sort: event.target.value });
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <SegmentedControl
          label="Transaction type"
          hideLabel
          name="transaction-group"
          size="sm"
          value={query.group}
          options={TRANSACTION_GROUP_FILTERS}
          onChange={(group) => update({ group })}
        />
      </Card>

      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1" aria-live="polite">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{results.length}</span> {results.length === 1 ? "transaction" : "transactions"}
          {filtersActive ? " match your filters" : ""}
        </p>
        <p className="tabular text-sm text-ink-muted">
          In <span className="font-semibold text-success">{formatRwf(totals.inflow)}</span> · Out{" "}
          <span className="font-semibold text-ink">{formatRwf(totals.outflow)}</span>
          <span className="block text-xs text-ink-subtle sm:inline sm:pl-1">(completed + pending; failed excluded)</span>
        </p>
      </div>

      <Card padding="none">
        {results.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title="No transactions match"
            description="Try a different search, or clear the filters to see everything."
            action={
              <Button variant="outline" onClick={() => update({ search: "", group: "all", status: "all" })}>
                <ListFilter aria-hidden="true" />
                Clear filters
              </Button>
            }
          />
        ) : dateSorted ? (
          <div>
            {groups.map((group) => (
              <section key={group.dayKey} aria-labelledby={`day-${group.dayKey}`} className="border-b border-border px-5 pt-4 pb-2 last:border-b-0 sm:px-6">
                <h2 id={`day-${group.dayKey}`} className="type-overline text-ink-subtle">
                  {group.dayKey === todayKey ? "Today · " : ""}
                  {formatWeekday(group.firstIso)}
                </h2>
                <div className="divide-y divide-border">
                  {group.transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border px-5 py-2 sm:px-6">
            {shown.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} showDate={formatDate(transaction.createdAt)} />
            ))}
          </div>
        )}
      </Card>

      {results.length > visible ? (
        <div className="flex flex-col items-center gap-2">
          <Button variant="outline" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
            Show more
          </Button>
          <p className="type-caption text-ink-subtle">
            Showing {shown.length} of {results.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
