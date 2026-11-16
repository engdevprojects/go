import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "inverse" | "on-dark";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand text-ink-inverse hover:bg-brand-strong shadow-card",
  secondary: "bg-brand-soft text-brand-strong hover:bg-brand-soft-strong",
  outline: "border border-border-strong bg-surface text-ink hover:bg-surface-muted",
  ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
  danger: "bg-danger text-ink-inverse hover:bg-danger-strong",
  inverse: "bg-surface text-brand-strong hover:bg-surface-muted",
  /** Secondary action on navy surfaces: light text with a subtle outline. */
  "on-dark": "text-ink-inverse ring-1 ring-ink-inverse/35 ring-inset hover:bg-ink-inverse/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/**
 * Class names for button-styled elements, shared by `Button` and `ButtonLink`
 * so links and buttons stay visually identical.
 */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", fullWidth = false): string {
  return cn(
    "focus-ring inline-flex shrink-0 items-center justify-center rounded-md font-semibold whitespace-nowrap",
    // Press feedback: a slight scale on :active (instant under reduced motion).
    "transition-[background-color,color,box-shadow,transform] duration-[var(--duration-fast)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Shows a spinner, sets aria-busy, and disables the button to prevent double submits. */
  loading?: boolean;
  /** Accessible text announced while loading. */
  loadingLabel?: string;
}

/**
 * The primary action control. Defaults to `type="button"` so it never submits
 * a form by accident; pass `type="submit"` explicitly for submit buttons.
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingLabel,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses(variant, size, fullWidth), className)}
      {...props}
    >
      {loading ? <Spinner size="sm" label={loadingLabel} /> : null}
      {loading && loadingLabel ? <span>{loadingLabel}</span> : children}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

/** A Next.js link styled as a button, for navigation actions. */
export function ButtonLink({ variant = "primary", size = "md", fullWidth = false, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClasses(variant, size, fullWidth), className)} {...props}>
      {children}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  variant?: Extract<ButtonVariant, "ghost" | "outline" | "secondary">;
  size?: "sm" | "md";
}

/** A square, icon-only button with a mandatory accessible label. */
export function IconButton({ label, variant = "ghost", size = "md", className, children, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center justify-center rounded-md transition-[background-color,color,transform] duration-[var(--duration-fast)] active:scale-95",
        "[&_svg]:size-5 disabled:opacity-55",
        size === "md" ? "size-11" : "size-9",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
