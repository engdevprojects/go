"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { DURATION, EASE_STANDARD } from "@/lib/motion";
import { formatMoney } from "@/lib/money";
import type { CurrencyCode } from "@/types/money";

interface AnimatedNumberProps {
  /** Final value (minor units when `currency` is set). */
  value: number;
  /** Format as money in this currency; omit for a plain integer count. */
  currency?: CurrencyCode;
  className?: string;
}

/** Formats a value the same way for the animated and the accessible text. */
function formatValue(value: number, currency?: CurrencyCode): string {
  return currency ? formatMoney({ amountMinor: Math.round(value), currency }) : Math.round(value).toLocaleString("en-US");
}

/**
 * Counts up to a value when it first appears, and tweens between values when
 * it meaningfully changes (e.g. after a demo top-up). It never animates
 * continuously. Screen readers and tests read the final value from a
 * visually-hidden copy; the moving digits are aria-hidden. With reduced
 * motion the final value is shown immediately.
 */
export function AnimatedNumber({ value, currency, className }: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const from = previous.current ?? 0;
    previous.current = value;
    if (reduce || from === value) {
      node.textContent = formatValue(value, currency);
      return;
    }
    const controls = animate(from, value, {
      duration: DURATION.count,
      ease: EASE_STANDARD,
      onUpdate: (latest) => {
        node.textContent = formatValue(latest, currency);
      },
    });
    return () => controls.stop();
  }, [value, currency, reduce]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" className="tabular">
        {formatValue(reduce ? value : 0, currency)}
      </span>
      <span className="sr-only">{formatValue(value, currency)}</span>
    </span>
  );
}
