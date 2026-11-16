"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "@/components/ui/button";

interface DialogProps {
  open: boolean;
  /** Called on Esc, backdrop click, or the close button. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Footer actions, right-aligned on wide screens and stacked on narrow ones. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** `drawer` slides in from the left edge (used for mobile navigation). */
  variant?: "modal" | "drawer";
  /** Hide the visible title (still used as the accessible name). */
  hideTitle?: boolean;
  /** Prevent closing while an action is in progress. */
  dismissible?: boolean;
}

const SIZES = { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-2xl" } as const;

/**
 * Accessible modal built on the native `<dialog>` element: the browser
 * provides focus trapping, inert background, Esc handling and focus return.
 * Entry/exit transitions use CSS `@starting-style`, so they respect the global
 * reduced-motion rule.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  variant = "modal",
  hideTitle = false,
  dismissible = true,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const isDrawer = variant === "drawer";

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "group m-0 overflow-visible bg-transparent p-0 open:flex",
        "backdrop:opacity-0 backdrop:transition-[opacity] backdrop:duration-[var(--duration-base)] open:backdrop:opacity-100 starting:open:backdrop:opacity-0",
        isDrawer ? "inset-y-0 left-0 h-dvh w-[min(20rem,88vw)]" : "inset-0 h-dvh w-full items-end justify-center sm:items-center sm:p-6",
      )}
    >
      <div
        className={cn(
          "flex max-h-dvh flex-col bg-surface shadow-overlay transition-[opacity,translate] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
          isDrawer
            ? "h-full w-full -translate-x-4 opacity-0 group-open:translate-x-0 group-open:opacity-100 starting:group-open:-translate-x-4 starting:group-open:opacity-0"
            : cn(
                "w-full rounded-t-xl sm:max-h-[min(44rem,calc(100dvh-3rem))] sm:rounded-xl",
                "translate-y-4 opacity-0 group-open:translate-y-0 group-open:opacity-100 starting:group-open:translate-y-4 starting:group-open:opacity-0",
                SIZES[size],
              ),
        )}
      >
        <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 sm:px-6", hideTitle && "sr-only")}>
          <div className="min-w-0">
            <h2 id={titleId} className="type-section-title text-ink">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="type-caption mt-1 text-ink-muted">
                {description}
              </p>
            ) : null}
          </div>
          {dismissible ? (
            <IconButton label="Close" size="sm" onClick={onClose} className="-mt-1 -mr-2">
              <X aria-hidden="true" />
            </IconButton>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>
        ) : null}
      </div>
    </dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  loading?: boolean;
}

/** A small yes/no dialog for destructive or significant actions. */
export function ConfirmDialog({ open, onCancel, onConfirm, title, description, confirmLabel, tone = "primary", loading = false }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      dismissible={!loading}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="type-body text-ink-muted">{description}</div>
    </Dialog>
  );
}
