import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Use `name` to make a group exclusive (one open at a time) in supporting browsers. */
  name?: string;
  className?: string;
}

/**
 * Disclosure built on native `<details>`/`<summary>`: keyboard and
 * screen-reader support with no JavaScript, so it works in Server Components.
 */
export function AccordionItem({ title, children, defaultOpen, name, className }: AccordionItemProps) {
  return (
    <details name={name} open={defaultOpen} className={cn("group border-b border-border last:border-b-0", className)}>
      <summary
        className={cn(
          "focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-4 text-left font-medium text-ink",
          "[&::-webkit-details-marker]:hidden hover:text-brand-strong",
        )}
      >
        <span className="min-w-0">{title}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-5 shrink-0 text-ink-subtle transition-transform duration-[var(--duration-base)] group-open:rotate-180"
        />
      </summary>
      <div className="type-body pb-5 text-ink-muted">{children}</div>
    </details>
  );
}

/** Wraps accordion items in a bordered group. */
export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-border bg-surface px-5", className)}>{children}</div>;
}
