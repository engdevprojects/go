"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TRANSITION } from "@/lib/motion";

interface SegmentedControlProps<Value extends string> {
  /** Group label (visually hidden when `hideLabel`). */
  label: string;
  hideLabel?: boolean;
  /** Radio group name; also scopes the sliding indicator, so it must be unique on the page. */
  name: string;
  value: Value;
  options: readonly { value: Value; label: ReactNode }[];
  onChange: (value: Value) => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Single-choice segmented control built on native radio inputs (arrow keys and
 * screen-reader semantics for free). The selected pill slides between options
 * with a shared-layout spring; with reduced motion it simply moves. Options
 * wrap rather than scroll so none are hidden on narrow screens.
 */
export function SegmentedControl<Value extends string>({
  label,
  hideLabel,
  name,
  value,
  options,
  onChange,
  size = "md",
  className,
}: SegmentedControlProps<Value>) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={cn("mb-1.5 text-sm font-medium text-ink", hideLabel && "sr-only")}>{label}</legend>
      <div className="flex max-w-full flex-wrap gap-1 rounded-md bg-surface-muted p-1">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                "relative flex shrink-0 cursor-pointer items-center justify-center rounded-sm font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)]",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-brand",
                size === "md" ? "h-9 px-3.5 text-sm" : "h-8 px-3 text-[0.8125rem]",
                selected ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId={`${name}-indicator`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-sm bg-surface shadow-card"
                  transition={TRANSITION.indicator}
                />
              ) : null}
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="relative">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
