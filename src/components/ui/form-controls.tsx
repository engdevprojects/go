import { Search } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const CONTROL_BASE =
  "focus-ring w-full rounded-md border bg-surface text-ink placeholder:text-ink-subtle transition-colors duration-[var(--duration-fast)] disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle";

/** Border classes reflecting validation state. */
function stateBorder(invalid: boolean | undefined): string {
  return invalid ? "border-danger" : "border-border-strong hover:border-ink-subtle";
}

interface FormFieldProps {
  /** Must match the control's `id`. */
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Visually marks the field as optional (required is the default). */
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + hint + error wrapper. The control must set
 * `aria-describedby={describedBy(id, hint, error)}` and `aria-invalid`.
 */
export function FormField({ id, label, hint, error, optional, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {optional ? <span className="ml-1 font-normal text-ink-subtle">(optional)</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="type-caption text-ink-muted">
          {hint}
        </p>
      ) : null}
      <FormError id={`${id}-error`} message={error} />
    </div>
  );
}

/** Field-level error text, announced politely when it appears. */
export function FormError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} aria-live="polite" className={cn("type-caption font-medium text-danger", message ? "animate-enter" : "sr-only")}>
      {message ?? ""}
    </p>
  );
}

/**
 * Builds `aria-describedby` for a control from the ids `FormField` renders.
 * @returns A space-separated id list, or undefined when there is nothing to describe.
 */
export function describedBy(id: string, hint?: unknown, error?: unknown): string | undefined {
  const ids = [hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

type InputProps = ComponentProps<"input"> & { invalid?: boolean; leading?: ReactNode; trailing?: ReactNode };

/** Text-like input with optional leading/trailing adornments. */
export function Input({ invalid, leading, trailing, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {leading ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-subtle [&_svg]:size-4">{leading}</span>
      ) : null}
      <input
        aria-invalid={invalid || undefined}
        className={cn(CONTROL_BASE, stateBorder(invalid), "h-11 px-3 text-[0.9375rem]", leading && "pl-9", trailing && "pr-12", className)}
        {...props}
      />
      {trailing ? <span className="absolute inset-y-0 right-1 flex items-center">{trailing}</span> : null}
    </div>
  );
}

type TextareaProps = ComponentProps<"textarea"> & { invalid?: boolean };

/** Multi-line text input. */
export function Textarea({ invalid, className, rows = 5, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL_BASE, stateBorder(invalid), "px-3 py-2.5 text-[0.9375rem] leading-relaxed", className)}
      {...props}
    />
  );
}

type SelectProps = ComponentProps<"select"> & { invalid?: boolean };

/** Native select — keyboard, screen-reader and mobile friendly by default. */
export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_BASE,
        stateBorder(invalid),
        "h-11 appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9 pl-3 text-[0.9375rem]",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23687386' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode };

/** Native checkbox with a clickable label and optional description. */
export function Checkbox({ id, label, description, className, ...props }: CheckboxProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input id={id} type="checkbox" className="focus-ring mt-0.5 size-5 shrink-0 rounded accent-brand" {...props} />
      <label htmlFor={id} className="text-sm">
        <span className="font-medium text-ink">{label}</span>
        {description ? <span className="type-caption mt-0.5 block text-ink-muted">{description}</span> : null}
      </label>
    </div>
  );
}

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

/** On/off toggle using the ARIA switch pattern on a native button. */
export function Switch({ id, checked, onCheckedChange, label, description, disabled }: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description ? (
          <p id={`${id}-description`} className="type-caption mt-0.5 text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "focus-ring relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-[var(--duration-fast)] disabled:opacity-55",
          checked ? "bg-brand" : "bg-border-strong",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-5 rounded-full bg-surface shadow-card transition-transform duration-[var(--duration-fast)]",
            checked ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

type SearchInputProps = Omit<ComponentProps<"input">, "type"> & { label: string };

/** Search box with a visually hidden label and a leading icon. */
export function SearchInput({ id, label, className, ...props }: SearchInputProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Input id={id} type="search" leading={<Search aria-hidden="true" />} autoComplete="off" {...props} />
    </div>
  );
}
