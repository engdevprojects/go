"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { APP_NAVIGATION, isActivePath } from "@/lib/config/navigation";
import { TRANSITION } from "@/lib/motion";

interface SidebarNavProps {
  unreadCount: number;
  /** Called after a link is chosen (closes the mobile drawer). */
  onNavigate?: () => void;
  /** Unique per rendered instance so the desktop and drawer indicators never animate into each other. */
  indicatorId: string;
  /**
   * Icon-rail mode for the collapsed desktop sidebar: labels and group titles
   * become screen-reader-only (accessible names are unchanged), each item
   * shows a tooltip on hover and keyboard focus, and the unread count becomes a dot.
   */
  collapsed?: boolean;
}

/**
 * Grouped app navigation used by the desktop sidebar and the mobile drawer.
 * The active highlight slides to the selected item (shared layout); the
 * unread badge pops in and out. Compact spacing keeps every item visible at
 * ~900 px viewport heights.
 */
export function SidebarNav({ unreadCount, onNavigate, indicatorId, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={collapsed ? "space-y-3" : "space-y-5"}>
      {APP_NAVIGATION.map((section, sectionIndex) => (
        <div key={section.title}>
          <p className={cn("type-overline mb-1.5 px-3 text-ink-subtle", collapsed && "sr-only")}>{section.title}</p>
          {collapsed && sectionIndex > 0 ? <hr aria-hidden="true" className="mx-3 mb-3 border-border" /> : null}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActivePath(item.href, pathname);
              const Icon = item.icon;
              const showUnread = item.showUnread && unreadCount > 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring group relative flex h-9 items-center rounded-md text-sm font-medium transition-colors duration-[var(--duration-fast)]",
                      collapsed ? "justify-center px-0" : "gap-3 px-3",
                      active ? "text-brand-strong" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId={`${indicatorId}-active`}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-md bg-brand-soft"
                        transition={TRANSITION.indicator}
                      />
                    ) : null}
                    <span className="relative inline-flex">
                      <Icon
                        className={cn(
                          "size-[1.125rem] shrink-0 transition-transform duration-[var(--duration-fast)]",
                          !collapsed && "group-hover:translate-x-0.5",
                        )}
                        aria-hidden="true"
                      />
                      {collapsed && showUnread ? (
                        <span aria-hidden="true" className="absolute -top-1 -right-1.5 size-2.5 rounded-full border-2 border-surface bg-danger" />
                      ) : null}
                    </span>
                    <span className={cn("relative flex-1 truncate", collapsed && "sr-only")}>
                      {item.label}
                      {collapsed && showUnread ? `, ${unreadCount} unread` : null}
                    </span>
                    {collapsed ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute top-1/2 left-full z-40 ml-3 -translate-y-1/2 rounded-md bg-ink px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-ink-inverse shadow-raised",
                          "invisible opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100",
                        )}
                      >
                        {item.label}
                      </span>
                    ) : null}
                    {collapsed ? null : (
                      <AnimatePresence initial={false}>
                        {showUnread ? (
                          <motion.span
                            key="badge"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, transition: TRANSITION.base }}
                            exit={{ scale: 0.6, opacity: 0, transition: TRANSITION.exit }}
                            className="relative rounded-full bg-brand px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-inverse"
                          >
                            {unreadCount}
                            <span className="sr-only"> unread</span>
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    )}
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
