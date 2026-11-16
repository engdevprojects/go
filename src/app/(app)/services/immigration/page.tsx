"use client";

import { CalendarDays, ExternalLink, Info, ShieldCheck, Timer } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader } from "@/components/ui/card";
import { DemoBadge } from "@/components/ui/badge";
import { FormField, Input } from "@/components/ui/form-controls";
import { DetailRow } from "@/components/ui/misc";
import { OFFICIAL_RESOURCES } from "@/lib/mock-data/guides";
import { DEMO_PROFILE } from "@/lib/mock-data/profile";

function calcStay(entryDate: string, stayDays: number): { remaining: number; endDate: string } | null {
  if (!entryDate || !stayDays || stayDays < 1) return null;
  const entry = new Date(entryDate);
  if (isNaN(entry.getTime())) return null;
  const end = new Date(entry);
  end.setDate(end.getDate() + stayDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const remaining = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
  return {
    remaining,
    endDate: end.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  };
}

export default function ImmigrationPage() {
  const passport = DEMO_PROFILE;
  const [entryDate, setEntryDate] = useState("");
  const [stayDays, setStayDays] = useState("");
  const calc = calcStay(entryDate, Number(stayDays));

  const urgency =
    calc === null ? null
    : calc.remaining <= 0 ? "expired"
    : calc.remaining <= 7 ? "critical"
    : calc.remaining <= 14 ? "warning"
    : "ok";

  const indicatorClasses =
    urgency === "expired" || urgency === "critical"
      ? { wrap: "border-danger bg-danger-soft", badge: "bg-danger text-ink-inverse" }
      : urgency === "warning"
      ? { wrap: "border-warning-fill bg-warning-soft", badge: "bg-warning-fill text-ink-inverse" }
      : { wrap: "border-brand bg-brand-soft", badge: "bg-brand text-ink-inverse" };

  return (
    <>
      <PageHeader
        title="Migration & Stay"
        description="Your passport details, permitted stay duration and remaining days."
        breadcrumbs={[{ label: "Services", href: "/services" }, { label: "Migration & Stay" }]}
      />
      <Alert tone="warning" title="Always check official sources" className="mb-6">
        This page shows information you submitted during registration. Your permitted stay is determined by the
        immigration authorities — not by this app. Check official sources for the rules that apply to your nationality.
      </Alert>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-brand/20 bg-brand-soft px-3 py-2">
        <span className="type-caption font-semibold text-brand-strong">Official source:</span>
        <a
          href="https://irembo.gov.rw"
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-brand-strong underline-offset-2 hover:underline"
        >
          Irembo
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <span className="type-caption text-ink-muted">No live integration exists in this demo.</span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">

          {/* Passport card with visual */}
          <Card as="section" aria-labelledby="passport-heading">
            <div className="flex items-start gap-5">
              {/* Passport booklet visual */}
              <div className="hidden shrink-0 sm:block" aria-hidden="true">
                <div className="relative h-32 w-44 overflow-hidden rounded-xl bg-gradient-to-br from-brand to-brand-strong p-4 shadow-raised">
                  {/* Concentric circle pattern */}
                  {[40, 64, 88, 112, 136].map((size) => (
                    <span
                      key={size}
                      className="absolute rounded-full border border-ink-inverse/10"
                      style={{
                        width: size,
                        height: size,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                      }}
                    />
                  ))}
                  <div className="relative flex flex-col gap-1">
                    <ShieldCheck className="size-7 text-ink-inverse/80" />
                    <p className="text-[0.55rem] font-bold uppercase tracking-widest text-ink-inverse/70">
                      Passport
                    </p>
                    <p className="text-xs font-semibold text-ink-inverse">
                      {passport.maskedPassport ?? "••• ••••••"}
                    </p>
                    <p className="mt-1 text-[0.5rem] text-ink-inverse/50">DEMO · SAMPLE DATA</p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 id="passport-heading" className="type-section-title text-ink">
                    Identity document
                  </h2>
                  <DemoBadge label="Sample data" />
                </div>
                <dl className="mt-4 divide-y divide-border">
                  <DetailRow label="Document type" value="Passport" />
                  <DetailRow label="Passport number" value={passport.maskedPassport ?? "Not submitted"} />
                  <DetailRow label="Verification status" value="Complete (demo)" />
                  <DetailRow label="Submitted" value="On registration" />
                </dl>
              </div>
            </div>
            <p className="type-caption mt-4 text-ink-subtle">
              Passport images and identity details are stored securely and used only for identity verification and fraud
              prevention.
            </p>
          </Card>

          {/* Stay calculator */}
          <Card as="section" aria-labelledby="stay-heading">
            <CardHeader
              id="stay-heading"
              title="Permitted stay"
              description="Enter your entry date and permitted stay length to see your remaining days"
            />
            <Alert tone="info" className="mb-5">
              Stay duration is determined by the immigration authorities at the time of entry. This app does not
              calculate or guarantee your permitted stay. Check your entry stamp or official approval for the exact
              dates.
            </Alert>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField id="entry-date" label="Entry date" hint="From your entry stamp">
                <Input
                  id="entry-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  leading={<CalendarDays aria-hidden="true" />}
                />
              </FormField>
              <FormField id="stay-days" label="Permitted stay (days)" hint="From your visa or entry approval">
                <Input
                  id="stay-days"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="365"
                  placeholder="e.g. 30"
                  value={stayDays}
                  onChange={(e) => setStayDays(e.target.value)}
                  leading={<Timer aria-hidden="true" />}
                />
              </FormField>
            </div>

            {calc !== null ? (
              <div
                className={`mt-5 rounded-xl border-2 p-5 ${indicatorClasses.wrap}`}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-bold tabular ${indicatorClasses.badge}`}
                    aria-hidden="true"
                  >
                    {calc.remaining <= 0 ? "!" : calc.remaining}
                  </span>
                  <div>
                    <p className="font-bold text-ink">
                      {calc.remaining <= 0
                        ? "Permitted stay has ended"
                        : calc.remaining === 1
                        ? "1 day remaining"
                        : `${calc.remaining} days remaining`}
                    </p>
                    <p className="type-caption text-ink-muted">
                      {calc.remaining <= 0
                        ? "Contact immigration authorities immediately."
                        : `Permitted stay ends ${calc.endDate}`}
                    </p>
                  </div>
                </div>
                {(urgency === "warning" || urgency === "critical") && (
                  <p className="type-caption mt-3 font-semibold text-ink">
                    Your permitted stay is approaching its end. Apply for any extension before it expires.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-canvas p-4">
                <Info className="size-5 shrink-0 text-brand" aria-hidden="true" />
                <p className="type-caption text-ink-muted">
                  Enter your entry date and permitted stay length above to see your remaining days.
                </p>
              </div>
            )}

            <p className="type-caption mt-4 text-ink-subtle">
              Only verified entry information and applicable immigration rules can determine your permitted stay. The
              official immigration authority makes this determination. This calculator is for your reference only.
            </p>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card as="section" aria-labelledby="official-heading">
            <CardHeader
              id="official-heading"
              title="Official resources"
              description="External sites — we don't control their content."
            />
            <ul className="space-y-4">
              {OFFICIAL_RESOURCES.map((resource) => (
                <li key={resource.url}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-brand-strong hover:underline"
                  >
                    {resource.name}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                  <p className="type-caption mt-0.5 text-ink-muted">{resource.description}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card as="section" aria-labelledby="reminders-heading">
            <CardHeader id="reminders-heading" title="Good to remember" />
            <ul className="type-caption list-disc space-y-2 pl-4 text-ink-muted">
              <li>Your wallet&apos;s period is separate from your permitted stay.</li>
              <li>Keep digital copies of your documents available offline.</li>
              <li>Apply for any extension before your permitted stay ends.</li>
              <li>
                Irembo (irembo.gov.rw) is Rwanda&apos;s official government services portal. This app has no
                integration with Irembo — visit the official site directly.
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
