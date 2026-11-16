import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { APP_VERSION, OPERATOR_NAME, PRODUCT_NAME } from "@/lib/config/product";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Exchange", href: "/#exchange" },
      { label: "Services", href: "/#services" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Demo",
    links: [
      { label: "Sign in to the demo", href: "/sign-in" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Help Centre", href: "/account/help" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "About", href: "/about" },
      { label: "Terms of Service (draft)", href: "/terms" },
      { label: "Privacy Policy (draft)", href: "/privacy" },
    ],
  },
] as const;

/** Public site footer with navigation and the demo / regulatory disclaimer. */
export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-marketing px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <BrandLogo />
            <p className="type-caption mt-4 max-w-xs text-ink-muted">
              {PRODUCT_NAME} is a visitor wallet concept by {OPERATOR_NAME}. This website is a product demonstration.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="type-overline mb-3 text-ink-subtle">{column.title}</h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="focus-ring rounded-sm text-sm text-ink-muted hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="type-caption mt-10 space-y-2 border-t border-border pt-6 text-ink-subtle">
          <p>
            Demo only: all balances, exchange rates, merchants and payments are sample data. No real money is moved and no
            real accounts are created. This website does not represent a licensed bank or payment institution, and figures
            shown remain subject to regulator and partner approval.
          </p>
          <p className="flex items-center gap-1.5">
            <span aria-hidden="true">🇷🇼</span>
            Made for visitors to Rwanda · Version {APP_VERSION}
          </p>
        </div>
      </div>
    </footer>
  );
}
