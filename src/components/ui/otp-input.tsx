"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

interface OtpInputProps {
  /** Group label read by screen readers (ignored when `labelledBy` is set). */
  label: string;
  /** id of a visible element that labels the group; preferred over `label`. */
  labelledBy?: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
  /** id of the error/hint element. */
  describedBy?: string;
  /** Called when every box is filled. */
  onComplete?: (value: string) => void;
}

/**
 * Segmented one-time-code input. Supports typing, Backspace navigation, arrow
 * keys, and pasting a whole code. The first box carries
 * `autocomplete="one-time-code"` so browsers can offer codes from email/SMS.
 * The value is held only in component state — never persisted.
 */
export function OtpInput({ label, labelledBy, value, onChange, length = 6, invalid, disabled, describedBy, onComplete }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  function focusBox(index: number) {
    inputs.current[Math.max(0, Math.min(length - 1, index))]?.focus();
  }

  function commit(next: string) {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  }

  function handleInput(index: number, raw: string) {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    if (typed.length > 1) {
      commit(value.slice(0, index) + typed);
      focusBox(index + typed.length);
      return;
    }
    const chars = digits.slice();
    chars[index] = typed;
    commit(chars.join(""));
    focusBox(index + 1);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const chars = digits.slice();
      if (chars[index]) {
        chars[index] = "";
        commit(chars.join(""));
      } else if (index > 0) {
        chars[index - 1] = "";
        commit(chars.join(""));
        focusBox(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    commit(pasted);
    focusBox(pasted.length);
  }

  return (
    <div role="group" aria-label={labelledBy ? undefined : label} aria-labelledby={labelledBy} aria-describedby={describedBy} className="flex justify-between gap-2 sm:justify-start">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={cn(
            "focus-ring type-amount h-14 w-full max-w-12 rounded-md border bg-surface text-center text-xl text-ink sm:w-12",
            invalid ? "border-danger" : "border-border-strong",
            "disabled:bg-surface-muted",
          )}
        />
      ))}
    </div>
  );
}
