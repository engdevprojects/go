import {
  ArrowLeftRight,
  BadgeCheck,
  Bell,
  BookUser,
  ChartPie,
  CircleHelp,
  CreditCard,
  Crown,
  FileText,
  Flag,
  Info,
  KeyRound,
  LayoutDashboard,
  Lock,
  MessageSquare,
  QrCode,
  ReceiptText,
  Signal,
  Smartphone,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/** A navigation destination in the signed-in app. */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Show the unread notification count next to this item. */
  showUnread?: boolean;
}

/** A titled navigation group. */
export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Sidebar / drawer navigation for the signed-in app. */
export const APP_NAVIGATION: readonly NavSection[] = [
  {
    title: "Wallet",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Wallet & exchange", href: "/wallet", icon: ArrowLeftRight },
      { label: "Transactions", href: "/transactions", icon: ReceiptText },
      { label: "Analytics", href: "/analytics", icon: ChartPie },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Pay & Tip", href: "/services/pay-tip", icon: QrCode },
      { label: "Mobile Money", href: "/services/mobile-money", icon: Smartphone },
      { label: "eSIM & Data", href: "/services/esim", icon: Signal },
      { label: "Migration & Stay", href: "/services/immigration", icon: BookUser },
      { label: "Cards", href: "/services/cards", icon: CreditCard },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/account", icon: UserRound },
      { label: "Notifications", href: "/account/notifications", icon: Bell, showUnread: true },
      { label: "Help Centre", href: "/account/help", icon: CircleHelp },
    ],
  },
];

/** Account-area navigation: every account destination has its own page. */
export const ACCOUNT_NAVIGATION: readonly NavSection[] = [
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/account", icon: UserRound },
      { label: "Notifications", href: "/account/notifications", icon: Bell, showUnread: true },
      { label: "Verification", href: "/account/verification", icon: BadgeCheck },
      { label: "Payment methods", href: "/account/payment-methods", icon: CreditCard },
      { label: "Change PIN", href: "/account/change-pin", icon: KeyRound },
      { label: "Upgrade to Premium", href: "/account/upgrade", icon: Crown },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help Centre", href: "/account/help", icon: CircleHelp },
      { label: "Contact support", href: "/account/contact-support", icon: MessageSquare },
      { label: "Report a problem", href: "/account/report-problem", icon: Flag },
    ],
  },
  {
    title: "Legal & info",
    items: [
      { label: "Terms of Service", href: "/account/terms", icon: FileText },
      { label: "Privacy Policy", href: "/account/privacy", icon: Lock },
      { label: "About", href: "/account/about", icon: Info },
    ],
  },
];

/**
 * Whether a nav item is the current section. `/account` matches only itself
 * so it doesn't stay highlighted on every account sub-page.
 */
export function isActivePath(href: string, pathname: string): boolean {
  if (href === "/account" || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
