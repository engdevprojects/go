import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** One step in a breadcrumb trail; the last item is the current page. */
export interface Crumb {
  label: string;
  href?: string;
}

/** Accessible breadcrumb trail. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-subtle">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link href={item.href} className="focus-ring rounded-sm hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "text-ink-muted")}>
                  {item.label}
                </span>
              )}
              {!last ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Primary page actions, aligned right on wide screens. */
  actions?: ReactNode;
  /** Small label above the title. */
  eyebrow?: ReactNode;
  className?: string;
}

/** Consistent page heading: breadcrumbs, the page's single h1, description, actions. */
export function PageHeader({ title, description, breadcrumbs, actions, eyebrow, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 sm:mb-8", className)}>
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
          <h1 className="type-page-title text-ink">{title}</h1>
          {description ? <p className="type-body mt-2 max-w-prose text-ink-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
