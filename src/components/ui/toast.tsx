"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "info" | "danger";

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  /** Shows a transient message. Use for confirmations, not for blocking errors. */
  toast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 5_000;

const ICONS: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 className="size-5 text-success" aria-hidden="true" />,
  info: <Info className="size-5 text-info" aria-hidden="true" />,
  danger: <XCircle className="size-5 text-danger" aria-hidden="true" />,
};

/**
 * Provides `useToast()` and renders a polite live region for announcements.
 * Toasts auto-dismiss after 5 s and can be closed manually.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);

  const toast = useCallback<ToastContextValue["toast"]>(
    (item) => {
      const id = nextId.current++;
      setItems((current) => [...current.slice(-2), { ...item, id }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-raised",
              )}
            >
              {ICONS[item.tone]}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                {item.description ? <p className="type-caption mt-0.5 text-ink-muted">{item.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="focus-ring -mt-1 -mr-1 rounded-sm p-1 text-ink-subtle hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Returns the toast function.
 * @throws If used outside `ToastProvider`.
 */
export function useToast(): ToastContextValue["toast"] {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context.toast;
}
