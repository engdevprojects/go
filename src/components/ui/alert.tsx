import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

const STYLES: Record<AlertTone, { box: string; icon: ReactNode }> = {
  info: { box: "border-info-border bg-info-soft", icon: <Info className="text-info" aria-hidden="true" /> },
  success: { box: "border-success-border bg-success-soft", icon: <CheckCircle2 className="text-success" aria-hidden="true" /> },
  warning: { box: "border-warning-border bg-warning-soft", icon: <AlertTriangle className="text-warning" aria-hidden="true" /> },
  danger: { box: "border-danger-border bg-danger-soft", icon: <XCircle className="text-danger" aria-hidden="true" /> },
};

interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  /**
   * Announce to assistive tech when the alert appears dynamically.
   * "polite" for confirmations, "assertive" for blocking errors.
   */
  live?: "polite" | "assertive";
  action?: ReactNode;
  className?: string;
}

/** Inline message with a tone, icon, optional title, and optional action. */
export function Alert({ tone = "info", title, children, live, action, className }: AlertProps) {
  const style = STYLES[tone];
  return (
    <div
      role={live === "assertive" ? "alert" : live === "polite" ? "status" : undefined}
      className={cn("flex gap-3 rounded-md border p-4 text-sm text-ink [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0", style.box, live && "animate-enter", className)}
    >
      {style.icon}
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn("text-ink-muted", title && "mt-0.5")}>{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
