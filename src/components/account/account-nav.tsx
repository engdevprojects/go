"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ACCOUNT_NAVIGATION, isActivePath } from "@/lib/config/navigation";
import { useDemoStore } from "@/lib/store/demo-store";

/**
 * Account-area navigation. `variant="sidebar"` is the compact desktop list;
 * `variant="list"` is the full-width settings list used on the profile page
 * for smaller screens.
 */
export function AccountNav({ variant = "sidebar" }: { variant?: "sidebar" | "list" }) {
  const pathname = usePathname();
  const { unreadCount } = useDemoStore();

  return (
    <nav aria-label="Account" className="space-y-6">
      {ACCOUNT_NAVIGATION.map((section) => (
        <div key={section.title}>
          <h2 className="type-overline mb-2 px-3 text-ink-subtle">{section.title}</h2>
          <ul className={cn(variant === "list" && "divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface")}>
            {section.items.map((item) => {
              const active = isActivePath(item.href, pathname);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring flex items-center gap-3 text-sm font-medium transition-colors",
                      variant === "sidebar"
                        ? cn("h-10 rounded-md px-3", active ? "bg-brand-soft text-brand-strong" : "text-ink-muted hover:bg-surface-muted hover:text-ink")
                        : "min-h-12 px-4 py-3 text-ink hover:bg-surface-muted",
                    )}
                  >
                    <Icon className="size-[1.125rem] shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {item.showUnread && unreadCount > 0 ? (
                      <span className="rounded-full bg-brand px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-inverse">
                        {unreadCount}
                        <span className="sr-only"> unread</span>
                      </span>
                    ) : null}
                    {variant === "list" ? <ChevronRight className="size-4 text-ink-subtle" aria-hidden="true" /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
