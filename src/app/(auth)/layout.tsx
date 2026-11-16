import { CircleCheck, Globe, ShieldCheck, Wifi } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";

const POINTS = [
  { text: "No local SIM or phone number needed" },
  { text: "Rate, fee and francs received shown before you pay" },
  { text: "Pay and tip at eKash merchants by QR" },
  { text: "Roaming data plans paid from your wallet" },
  { text: "Refund your remaining balance when you leave" },
] as const;

/** Split-screen layout for sign-in and verification. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-ink-inverse lg:flex lg:flex-col">
        {/* Decorative background shapes */}
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-brand-strong/35" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-20 size-56 rounded-full bg-brand-strong/25" aria-hidden="true" />
        <div className="absolute top-1/2 right-8 size-32 rounded-full bg-accent/10" aria-hidden="true" />
        <div className="relative">
          <BrandLogo inverse />
        </div>
        <div className="relative my-auto max-w-md">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
            <span className="type-overline text-accent">Secure demo</span>
          </div>
          <h2 className="type-page-title">A wallet built for visitors to Rwanda</h2>
          <p className="mt-3 text-sm text-ink-inverse/70">Manage your funds, pay merchants and stay connected — all from one place.</p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((point) => (
              <li key={point.text} className="flex items-start gap-3 text-sm text-ink-inverse/85">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                {point.text}
              </li>
            ))}
          </ul>
          {/* Mini trust badges */}
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-inverse/10 px-3 py-1.5 text-xs font-semibold text-ink-inverse/80">
              <Globe className="size-3.5" aria-hidden="true" />
              International visitors
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-inverse/10 px-3 py-1.5 text-xs font-semibold text-ink-inverse/80">
              <Wifi className="size-3.5" aria-hidden="true" />
              No SIM required
            </span>
          </div>
        </div>
        <p className="relative type-caption text-ink-inverse/50">Demo only — no real accounts, money or emails.</p>
      </aside>
      <main id="main-content" className="flex flex-col bg-surface px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <BrandLogo />
        </div>
        <div className="mx-auto flex w-full max-w-form flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
