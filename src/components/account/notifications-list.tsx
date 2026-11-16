"use client";

import { BadgeCheck, Bell, BellOff, CalendarClock, CheckCheck, CreditCard, Megaphone, ShieldAlert, Wallet } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/dates";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import type { NotificationKind } from "@/types/notification";

const KIND_ICONS: Record<NotificationKind, ReactNode> = {
  payment: <Wallet />,
  top_up: <CreditCard />,
  security: <ShieldAlert />,
  verification: <BadgeCheck />,
  expiry: <CalendarClock />,
  product: <Megaphone />,
};

type Filter = "all" | "unread";

/**
 * Notification centre: all/unread filter, mark one or all as read, and links
 * to the related page. Read state persists in this browser.
 */
export function NotificationsList() {
  const { notifications, unreadCount, now } = useDemoStore();
  const { markNotificationRead, markAllNotificationsRead } = useDemoActions();
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "unread" ? notifications.filter((notification) => !notification.read) : notifications;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `You have ${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}.` : "You're all caught up."}
        breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Notifications" }]}
        actions={
          <Button variant="outline" onClick={markAllNotificationsRead} disabled={unreadCount === 0}>
            <CheckCheck aria-hidden="true" />
            Mark all as read
          </Button>
        }
      />

      <SegmentedControl
        label="Show"
        hideLabel
        name="notification-filter"
        value={filter}
        options={[
          { value: "all", label: `All (${notifications.length})` },
          { value: "unread", label: `Unread (${unreadCount})` },
        ]}
        onChange={setFilter}
        className="mb-4"
      />

      <Card padding="none">
        {visible.length === 0 ? (
          <EmptyState
            icon={filter === "unread" ? <BellOff /> : <Bell />}
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            description={filter === "unread" ? "Everything has been read." : "Payment, top-up and security alerts will appear here."}
            action={filter === "unread" ? <Button variant="outline" onClick={() => setFilter("all")}>Show all</Button> : undefined}
          />
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((notification) => (
              <li key={notification.id} className={cn("flex gap-4 px-5 py-4 sm:px-6", !notification.read && "bg-brand-soft/40")}>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-[1.125rem]",
                    notification.read ? "bg-surface-muted text-ink-subtle" : "bg-brand-soft text-brand-strong",
                  )}
                >
                  {KIND_ICONS[notification.kind]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h2 className={cn("text-sm text-ink", !notification.read && "font-semibold")}>
                      {notification.title}
                      {!notification.read ? <span className="sr-only"> (unread)</span> : null}
                    </h2>
                    <p className="type-caption text-ink-subtle">{formatRelative(notification.createdAt, now)}</p>
                  </div>
                  <p className="type-caption mt-0.5 text-ink-muted">{notification.body}</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {notification.href ? (
                      <Link
                        href={notification.href}
                        onClick={() => markNotificationRead(notification.id)}
                        className="focus-ring rounded-sm text-sm font-semibold text-brand-strong hover:underline"
                      >
                        View details
                      </Link>
                    ) : null}
                    {!notification.read ? (
                      <button type="button" onClick={() => markNotificationRead(notification.id)} className="focus-ring inline-flex min-h-6 items-center rounded-sm text-sm font-medium text-ink-muted hover:text-ink">
                        Mark as read
                      </button>
                    ) : null}
                  </div>
                </div>
                {!notification.read ? <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rounded-full bg-brand" /> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
