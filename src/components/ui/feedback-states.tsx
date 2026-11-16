import { AlertOctagon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  /** Suggested next step (button or link). */
  action?: ReactNode;
  className?: string;
  /** Heading level to keep the outline correct where it's used. */
  headingLevel?: "h2" | "h3";
}

/** A friendly "nothing here" state that always suggests what to do next. */
export function EmptyState({ icon, title, description, action, className, headingLevel: Heading = "h3" }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-surface-muted text-ink-subtle [&_svg]:size-6" aria-hidden="true">
        {icon}
      </div>
      <Heading className="type-card-title text-ink">{title}</Heading>
      {description ? <p className="type-caption mt-1.5 max-w-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: ReactNode;
  /** Retry or recovery control. */
  action?: ReactNode;
  className?: string;
}

/** A recoverable error message. Never shows technical details. */
export function ErrorState({
  title = "Something went wrong",
  description = "This part of the page couldn't load. Your demo data is safe.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger" aria-hidden="true">
        <AlertOctagon className="size-6" />
      </div>
      <h2 className="type-card-title text-ink">{title}</h2>
      <p className="type-caption mt-1.5 max-w-sm text-ink-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
