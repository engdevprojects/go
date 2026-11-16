import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Render as a landmark-friendly element when the card is a page section. */
  as?: "div" | "section" | "article" | "aside" | "figure";
  padding?: "none" | "md" | "lg";
}

/** The standard surface: white, hairline border, restrained shadow, `rounded-lg`. */
export function Card({ as: Element = "div", padding = "md", className, children, ...props }: CardProps) {
  return (
    <Element
      className={cn(
        // min-w-0 lets cards shrink inside grid/flex tracks instead of growing to their widest child.
        "min-w-0 rounded-lg border border-border bg-surface shadow-card",
        padding === "md" && "p-5 sm:p-6",
        padding === "lg" && "p-6 sm:p-8",
        className,
      )}
      {...props}
    >
      {children}
    </Element>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Optional trailing action (link or button). */
  action?: ReactNode;
  /** Heading level for document outline; defaults to h2. */
  level?: "h2" | "h3";
  id?: string;
  className?: string;
}

/** Title row for a card with an optional description and trailing action. */
export function CardHeader({ title, description, action, level: Heading = "h2", id, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <Heading id={id} className="type-section-title text-ink">
          {title}
        </Heading>
        {description ? <p className="type-caption mt-1 text-ink-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
