"use client";

import { Bell, FlaskConical, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { IconButton } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/misc";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useSidebarCollapsed } from "@/lib/browser/sidebar-preference";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store/demo-store";
import { signedOutRecently } from "@/lib/store/demo-store-core";
import { fadeUp, TRANSITION } from "@/lib/motion";

/**
 * Chrome for every signed-in page: skip link, desktop sidebar (collapsible
 * to an icon rail; the choice is remembered per browser), sticky top bar,
 * mobile navigation drawer, and a light page transition.
 *
 * It also acts as the demo route guard: once browser state is loaded, a
 * visitor without a demo session is sent to sign-in. This is a UX guard for
 * the demo only — not a security boundary.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { hydrated, data, profile, unreadCount } = useDemoStore();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarCollapsed();
  const signedIn = data.session !== null;

  useEffect(() => {
    if (!hydrated || signedIn) return;
    router.replace(signedOutRecently() ? "/" : `/sign-in?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, signedIn, pathname, router]);

  const fullName = `${profile.givenName} ${profile.familyName}`;

  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="focus-ring sr-only z-50 rounded-md bg-surface px-4 py-2 font-semibold text-brand-strong shadow-raised focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside
        id="app-sidebar"
        aria-label="Sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-surface transition-[width] duration-[var(--duration-base)] ease-[var(--ease-standard)] lg:flex print:hidden",
          sidebarCollapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div className={cn("flex shrink-0 items-center", sidebarCollapsed ? "h-auto flex-col gap-2 px-2 pt-3 pb-2" : "h-16 justify-between gap-2 pr-2 pl-5")}>
          <BrandLogo href="/dashboard" compact={sidebarCollapsed} />
          <IconButton
            label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="sm"
            aria-expanded={!sidebarCollapsed}
            aria-controls="app-sidebar"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          </IconButton>
        </div>
        {/* Collapsed: overflow stays visible so item tooltips aren't clipped. */}
        <div className={cn("flex-1 px-3 pt-1 pb-4", sidebarCollapsed ? "overflow-visible" : "overflow-y-auto [scrollbar-width:thin]")}>
          <SidebarNav unreadCount={unreadCount} indicatorId="sidebar" collapsed={sidebarCollapsed} />
        </div>
        {sidebarCollapsed ? (
          <p className="flex justify-center border-t border-border py-3 text-ink-subtle" title="Demo · sample data only">
            <FlaskConical className="size-4" aria-hidden="true" />
            <span className="sr-only">Demo · sample data only</span>
          </p>
        ) : (
          <p className="type-caption border-t border-border px-5 py-3 text-ink-subtle">Demo · sample data only</p>
        )}
      </aside>

      <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Menu" variant="drawer" hideTitle>
        <div className="-mx-2 -mt-2 mb-6 flex items-center justify-between">
          <BrandLogo href="/dashboard" />
        </div>
        <SidebarNav unreadCount={unreadCount} onNavigate={() => setDrawerOpen(false)} indicatorId="drawer" />
      </Dialog>

      <div className={cn("transition-[padding] duration-[var(--duration-base)] ease-[var(--ease-standard)] print:pl-0", sidebarCollapsed ? "lg:pl-[4.5rem]" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 border-b border-border bg-surface print:hidden">
          <div className="mx-auto flex h-16 max-w-app items-center gap-3 px-4 sm:px-6 lg:px-8">
            <IconButton label="Open menu" className="-ml-2 lg:hidden" onClick={() => setDrawerOpen(true)}>
              <Menu aria-hidden="true" />
            </IconButton>
            <div className="lg:hidden">
              <BrandLogo href="/dashboard" />
            </div>
            <p className="ml-auto hidden items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong sm:inline-flex lg:ml-0">
              <FlaskConical className="size-3.5" aria-hidden="true" />
              Demo · sample data
            </p>
            <div className="ml-auto flex items-center gap-1">
              <NotificationBell unreadCount={unreadCount} />
              <Link
                href="/account"
                className="focus-ring flex items-center gap-2.5 rounded-md p-1.5 hover:bg-surface-muted sm:pr-3"
                aria-label={`Profile: ${fullName}`}
              >
                <Avatar name={fullName} size="sm" />
                <span className="hidden text-sm font-semibold text-ink md:inline">{profile.givenName}</span>
              </Link>
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto max-w-app px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8">
          {!hydrated || !signedIn ? (
            <PageSkeleton label={hydrated ? "Redirecting to sign-in" : "Loading your demo wallet"} />
          ) : (
            <motion.div key={pathname} variants={fadeUp} initial="hidden" animate="visible">
              {children}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Header link to notifications. The bell gives one short nudge only when the
 * unread count goes up (a meaningful change) — never on first render, never
 * on a loop, and not at all with reduced motion. The dot pops in and out.
 */
function NotificationBell({ unreadCount }: { unreadCount: number }) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const reduce = useReducedMotion();
  const previous = useRef<number | null>(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = unreadCount;
    if (reduce || before === null || unreadCount <= before || !scope.current) return;
    void animate(scope.current, { rotate: [0, -14, 11, -6, 0] }, { duration: 0.55, ease: "easeOut" });
  }, [unreadCount, reduce, animate, scope]);

  return (
    <Link
      href="/account/notifications"
      className="focus-ring relative inline-flex size-11 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
    >
      <span ref={scope} className="inline-flex origin-top">
        <Bell className="size-5" aria-hidden="true" />
      </span>
      <AnimatePresence initial={false}>
        {unreadCount > 0 ? (
          <motion.span
            key="dot"
            aria-hidden="true"
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: TRANSITION.base }}
            exit={{ scale: 0, transition: TRANSITION.exit }}
            className="absolute top-2 right-2 size-2.5 rounded-full border-2 border-surface bg-danger"
          />
        ) : null}
      </AnimatePresence>
    </Link>
  );
}