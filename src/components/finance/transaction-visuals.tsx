import {
  ArrowDownLeft,
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  HandCoins,
  Hourglass,
  Receipt,
  Send,
  ShoppingBag,
  Signal,
  Undo2,
  Utensils,
  Car,
  Mountain,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { TRANSACTION_STATUS_LABELS } from "@/lib/ledger";
import type { SpendingCategory, Transaction, TransactionStatus } from "@/types/transaction";

const CATEGORY_ICONS: Record<SpendingCategory, ReactNode> = {
  food_dining: <Utensils />,
  transport: <Car />,
  activities: <Mountain />,
  shopping: <ShoppingBag />,
  connectivity: <Signal />,
  transfers: <Send />,
  tips: <HandCoins />,
  service_fees: <Receipt />,
};

/** Picks the icon for a transaction: credits by type, debits by category. */
function iconFor(transaction: Transaction): ReactNode {
  if (transaction.type === "top_up") return <ArrowDownLeft />;
  if (transaction.type === "refund") return <Undo2 />;
  if (transaction.type === "activation_fee" || transaction.type === "extension_fee") return <CreditCard />;
  return transaction.category ? CATEGORY_ICONS[transaction.category] : <Receipt />;
}

/** Round icon tile for a transaction. Decorative — the row text carries meaning. */
export function TransactionIcon({ transaction, className }: { transaction: Transaction; className?: string }) {
  const icon = iconFor(transaction);
  const credit = transaction.walletAmountRwf > 0;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-[1.125rem]",
        credit ? "bg-success-soft text-success" : "bg-brand-soft text-brand-strong",
        transaction.status === "failed" && "bg-surface-muted text-ink-subtle",
        className,
      )}
    >
      {icon}
    </span>
  );
}

const STATUS_STYLES: Record<TransactionStatus, { tone: BadgeTone; icon: LucideIcon }> = {
  completed: { tone: "success", icon: CircleCheck },
  pending: { tone: "warning", icon: Hourglass },
  failed: { tone: "danger", icon: CircleAlert },
  reversed: { tone: "neutral", icon: Clock },
};

/** Status badge with icon + text, so status never depends on colour alone. */
export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { tone, icon: Icon } = STATUS_STYLES[status];
  return (
    <Badge tone={tone} icon={<Icon aria-hidden="true" />}>
      {TRANSACTION_STATUS_LABELS[status]}
    </Badge>
  );
}
