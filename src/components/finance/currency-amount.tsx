import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import type { Money } from "@/types/money";

interface CurrencyAmountProps {
  money: Money;
  /** Show "+" on credits; debits always show "−". */
  signed?: boolean;
  /** Colour credits green (debits stay ink — red is reserved for errors). */
  colorize?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
}

const SIZES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl",
  hero: "text-4xl sm:text-5xl",
} as const;

/**
 * Renders a monetary value with tabular numerals and its ISO currency code.
 * Display only — calculations happen on integer minor units elsewhere.
 */
export function CurrencyAmount({ money, signed = false, colorize = false, size = "md", className }: CurrencyAmountProps) {
  return (
    <span
      className={cn(
        "type-amount whitespace-nowrap",
        SIZES[size],
        colorize && money.amountMinor > 0 ? "text-success" : "text-ink",
        className,
      )}
    >
      {formatMoney(money, { signed })}
    </span>
  );
}
