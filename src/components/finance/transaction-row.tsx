import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { CurrencyAmount } from "@/components/finance/currency-amount";
import { TransactionIcon, TransactionStatusBadge } from "@/components/finance/transaction-visuals";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/dates";
import { CATEGORY_LABELS, headlineAmount, TRANSACTION_TYPE_LABELS } from "@/lib/ledger";
import type { Transaction } from "@/types/transaction";

interface TransactionRowProps {
  transaction: Transaction;
  /** Show the date instead of only the time (for ungrouped lists). */
  showDate?: string;
  /** Render as static content (e.g. in a marketing illustration) instead of a link. */
  interactive?: boolean;
  className?: string;
}

/**
 * One transaction as a full-width link to its detail page. The status badge
 * is shown only when it isn't "completed", to keep long lists calm.
 */
export function TransactionRow({ transaction, showDate, interactive = true, className }: TransactionRowProps) {
  const { money, onCard } = headlineAmount(transaction);
  const meta = [
    transaction.category ? CATEGORY_LABELS[transaction.category] : TRANSACTION_TYPE_LABELS[transaction.type],
    showDate ?? formatTime(transaction.createdAt),
  ].join(" · ");

  const content = (
    <>
      <TransactionIcon transaction={transaction} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{transaction.title}</p>
        <p className="type-caption truncate text-ink-muted">{meta}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <CurrencyAmount
          money={money}
          signed
          colorize
          size="sm"
          className={cn(transaction.status === "failed" && "text-ink-subtle line-through")}
        />
        {transaction.status !== "completed" ? (
          <TransactionStatusBadge status={transaction.status} />
        ) : onCard ? (
          <span className="type-caption text-ink-subtle">Charged to card</span>
        ) : null}
      </div>
    </>
  );

  if (!interactive) {
    return <div className={cn("flex items-center gap-3 py-3", className)}>{content}</div>;
  }

  return (
    <Link
      href={`/transactions/${transaction.id}`}
      className={cn(
        "focus-ring group -mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors duration-[var(--duration-fast)] hover:bg-surface-muted",
        className,
      )}
    >
      {content}
      <ChevronRight className="hidden size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden="true" />
    </Link>
  );
}
