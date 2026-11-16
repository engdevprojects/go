"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ButtonLink, IconButton } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

const LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Exchange", href: "/#exchange" },
  { label: "Services", href: "/#services" },
  { label: "Transparency", href: "/#transparency" },
  { label: "FAQ", href: "/#faq" },
] as const;

/** Public site header with scroll-aware shadow and mobile menu drawer. */
export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border bg-surface transition-shadow duration-[var(--duration-base)]",
        scrolled && "shadow-card",
      )}
    >
      <div className="mx-auto flex h-16 max-w-marketing items-center gap-6 px-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <nav aria-label="Main" className="hidden flex-1 lg:block">
          <ul className="flex items-center justify-center gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ButtonLink href="/sign-in" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
          <ButtonLink href="/sign-in" size="sm">
            Try the demo
          </ButtonLink>
          <IconButton label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Menu" variant="drawer" hideTitle>
        <div className="-mx-2 -mt-2 mb-6">
          <BrandLogo />
        </div>
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring flex h-11 items-center rounded-md px-3 font-medium text-ink hover:bg-surface-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 grid gap-2">
          <ButtonLink href="/sign-in" fullWidth onClick={() => setOpen(false)}>
            Try the demo
          </ButtonLink>
          <ButtonLink href="/sign-in" variant="ghost" fullWidth onClick={() => setOpen(false)}>
            Sign in
          </ButtonLink>
        </div>
      </Dialog>
    </header>
  );
}
