import { CircleCheck, Mail, ScanFace, ShieldCheck, Ticket, BookUser } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { TIER_LIMITS } from "@/lib/config/product";
import { formatUsd } from "@/lib/money";
import { DEMO_PROFILE } from "@/lib/mock-data/profile";

export const metadata: Metadata = { title: "Verification" };

interface Check {
  icon: ReactNode;
  title: string;
  body: string;
  requirement: string;
}

/** The checks described in UR-01, UR-03 and UR-05. Results shown are demo values. */
const CHECKS: readonly Check[] = [
  { icon: <Mail />, title: "Email confirmed", body: "Six-digit code entered within 10 minutes.", requirement: "UR-01" },
  { icon: <BookUser />, title: "Passport read", body: "Passport chip read by NFC (or photo page on phones without NFC, capped at Standard).", requirement: "UR-03 / UR-04" },
  { icon: <ScanFace />, title: "Liveness selfie", body: "A short selfie check that the person is present.", requirement: "UR-03" },
  { icon: <ShieldCheck />, title: "Sanctions and PEP screening", body: "Name screening by a screening provider; matches go to manual review.", requirement: "UR-03" },
  { icon: <Ticket />, title: "Ticket or permit linked", body: "A gorilla permit or convention badge verified with the issuer moves you to Verified.", requirement: "UR-05" },
];

/** Verification status and how the identity journey works (demo values only). */
export default function VerificationPage() {
  const currentTier = TIER_LIMITS[DEMO_PROFILE.tier];
  return (
    <>
      <PageHeader
        title="Verification"
        description="How identity checks set your wallet tier."
        breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Verification" }]}
      />
      <Alert tone="warning" title="No real checks have run" className="mb-6">
        These are demo results for a fictional visitor. No passport, selfie, sanctions or PEP check was performed, and nothing here is an official
        or legal verification. Real checks need eKYC and screening providers.
      </Alert>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card as="section" aria-labelledby="checks-heading">
          <CardHeader id="checks-heading" title="Identity checks" action={<DemoBadge label="Demo results" />} />
          <ol className="space-y-3">
            {CHECKS.map((check) => (
              <li key={check.title} className="flex gap-4 rounded-xl border border-border bg-canvas p-4 transition-shadow hover:shadow-card">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success [&_svg]:size-5" aria-hidden="true">
                  {check.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{check.title}</h3>
                    <Badge tone="success" icon={<CircleCheck aria-hidden="true" />}>
                      Passed (demo)
                    </Badge>
                  </div>
                  <p className="type-caption mt-0.5 text-ink-muted">{check.body}</p>
                  <p className="type-caption mt-0.5 text-ink-subtle">Requirement {check.requirement}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-6">
          <Card as="section" aria-labelledby="tier-heading">
            <CardHeader id="tier-heading" title="Current tier" />
            <p className="type-amount text-2xl text-ink">{currentTier.label}</p>
            <p className="type-caption mt-1 text-ink-muted">
              Up to {formatUsd(currentTier.perConversionUsdMinor)} per conversion and balance, {formatUsd(currentTier.rolling30DayUsdMinor ?? 0)} per 30 days.
            </p>
            <ButtonLink href="/account/upgrade" variant="secondary" className="mt-4">
              Compare with Premium
            </ButtonLink>
          </Card>
          <Card as="section" aria-labelledby="flow-heading">
            <CardHeader id="flow-heading" title="How it works" />
            <ul className="type-caption list-disc space-y-2 pl-4 text-ink-muted">
              <li>Most results are expected within 2 minutes; unclear results go to a person for manual review.</li>
              <li>If a linked ticket is cancelled or refunded, the wallet drops to Standard and keeps its balance.</li>
              <li>Passport images would be encrypted, and passport numbers are masked in the app.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
