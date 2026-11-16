import { DetailRow } from "@/components/ui/misc";
import { formatDateTime } from "@/lib/dates";
import { formatRate } from "@/lib/fx";
import { formatMoney, formatRwf } from "@/lib/money";
import type { ConvertBackQuote, TopUpQuote } from "@/types/exchange";

/** Line-by-line breakdown of a top-up quote. Fee is always its own line. */
export function TopUpQuoteSummary({ quote }: { quote: TopUpQuote }) {
  return (
    <dl className="divide-y divide-border">
      <DetailRow label="Amount to convert" value={formatMoney(quote.amount)} />
      <DetailRow label="Top-up fee (2%, illustrative)" value={formatMoney(quote.fee)} />
      <DetailRow label="Total charged to card" value={formatMoney(quote.totalCharged)} />
      <DetailRow label="Sample rate" value={formatRate(quote.amount.currency, quote.rateMilli)} />
      <DetailRow label="Rate sample time" value={`${formatDateTime(quote.rateAsOf)} (Kigali)`} />
      <DetailRow label="Wallet receives" value={formatRwf(quote.receiveRwf)} emphasis />
    </dl>
  );
}

/** Line-by-line breakdown of a convert-back estimate. */
export function ConvertBackSummary({ quote }: { quote: ConvertBackQuote }) {
  return (
    <dl className="divide-y divide-border">
      <DetailRow label="Francs converted" value={formatRwf(quote.amountRwf)} />
      <DetailRow label="Sample rate" value={formatRate(quote.grossReturn.currency, quote.rateMilli)} />
      <DetailRow label="Converted amount" value={formatMoney(quote.grossReturn)} />
      <DetailRow label="Refund deduction (USD 3, illustrative)" value={`−${formatMoney(quote.deduction)}`} />
      <DetailRow label="Estimated return to card" value={formatMoney(quote.netReturn)} emphasis />
    </dl>
  );
}
