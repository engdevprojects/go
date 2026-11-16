"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Crown, Hourglass, Minus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Checkbox, describedBy, FormError, FormField, Select } from "@/components/ui/form-controls";
import { DemoNotice } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { TIER_LIMITS } from "@/lib/config/product";
import { formatDateTime } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { premiumApplicationSchema, type PremiumApplicationValues } from "@/lib/validation/account";
import type { WalletTier } from "@/types/wallet";

const TIERS: WalletTier[] = ["standard", "verified", "premium"];

const FEATURES: readonly { label: string; tiers: Record<WalletTier, boolean> }[] = [
  { label: "Card top-ups, eKash payments and tips", tiers: { standard: true, verified: true, premium: true } },
  { label: "Roaming data plans", tiers: { standard: true, verified: true, premium: true } },
  { label: "Top up again below USD 2,000 balance", tiers: { standard: false, verified: true, premium: true } },
  { label: "Linked ticket or permit", tiers: { standard: false, verified: true, premium: true } },
  { label: "Compliance-approved higher limits", tiers: { standard: false, verified: false, premium: true } },
];

const SOURCES_OF_FUNDS = ["Employment income", "Savings", "Business income", "Other"] as const;

/**
 * Premium comparison and a demo application (UR-07). The requirements set no
 * upgrade fee, so none is shown. Submitting records a pending demo
 * application only — nothing is approved or activated.
 */
export function UpgradeView() {
  const { profile, data } = useDemoStore();
  const { setPremiumApplication } = useDemoActions();
  const toast = useToast();
  const [applying, setApplying] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const pending = data.premiumApplicationAt;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PremiumApplicationValues>({
    resolver: zodResolver(premiumApplicationSchema),
    defaultValues: { hasTicket: false },
  });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 900));
    setPremiumApplication(true);
    reset();
    setApplying(false);
    toast({ tone: "info", title: "Demo application submitted", description: "Nothing was approved or charged." });
  }

  return (
    <>
      <PageHeader
        title="Upgrade to Premium"
        description="Higher limits for visitors with a VIP or hospitality ticket, subject to compliance approval."
        breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Upgrade to Premium" }]}
      />
      <DemoNotice className="mb-6">No upgrade fee is set in the requirements, so none is shown. Applying here doesn&apos;t change your limits.</DemoNotice>

      {pending ? (
        <Alert
          tone="info"
          title="Premium application pending review (demo)"
          className="mb-6"
          action={
            <Button variant="outline" size="sm" onClick={() => setConfirmCancel(true)}>
              Withdraw application
            </Button>
          }
        >
          Submitted {formatDateTime(pending)}. In the planned service, a compliance officer would review it. Your tier stays {TIER_LIMITS[profile.tier].label}.
        </Alert>
      ) : null}

      <Card as="section" aria-labelledby="compare-heading" padding="none" className="overflow-hidden">
        <div className="p-5 sm:p-6">
          <CardHeader id="compare-heading" title="Compare tiers" className="mb-0" />
        </div>
        {/* `relative` keeps the absolutely positioned sr-only labels inside the scroll container. */}
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">Wallet tier comparison</caption>
            <thead className="bg-surface-muted">
              <tr>
                <th scope="col" className="px-5 py-3 text-left font-medium text-ink-muted sm:px-6">
                  <span className="sr-only">Feature</span>
                </th>
                {TIERS.map((tier) => (
                  <th key={tier} scope="col" className={cn("px-4 py-3 text-left font-semibold text-ink", tier === profile.tier && "bg-brand-soft")}>
                    <span className="flex items-center gap-1.5">
                      {tier === "premium" ? <Crown className="size-4 text-warning-fill" aria-hidden="true" /> : null}
                      {TIER_LIMITS[tier].label}
                    </span>
                    {tier === profile.tier ? <span className="type-caption block font-normal text-brand-strong">Your tier</span> : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <th scope="row" className="px-5 py-3 text-left font-medium text-ink sm:px-6">Per conversion</th>
                {TIERS.map((tier) => (
                  <td key={tier} className={cn("tabular px-4 py-3 text-ink", tier === profile.tier && "bg-brand-soft/50")}>
                    {formatUsd(TIER_LIMITS[tier].perConversionUsdMinor)}
                    {tier === "standard" ? <span className="type-caption block text-ink-muted">first 24 h</span> : null}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="px-5 py-3 text-left font-medium text-ink sm:px-6">Per 30 days</th>
                {TIERS.map((tier) => (
                  <td key={tier} className={cn("tabular px-4 py-3 text-ink", tier === profile.tier && "bg-brand-soft/50")}>
                    {TIER_LIMITS[tier].rolling30DayUsdMinor ? formatUsd(TIER_LIMITS[tier].rolling30DayUsdMinor ?? 0) : "—"}
                  </td>
                ))}
              </tr>
              {FEATURES.map((feature) => (
                <tr key={feature.label}>
                  <th scope="row" className="px-5 py-3 text-left font-normal text-ink sm:px-6">{feature.label}</th>
                  {TIERS.map((tier) => (
                    <td key={tier} className={cn("px-4 py-3", tier === profile.tier && "bg-brand-soft/50")}>
                      {feature.tiers[tier] ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Check className="size-4" aria-hidden="true" />
                          <span className="sr-only">Included</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-ink-subtle">
                          <Minus className="size-4" aria-hidden="true" />
                          <span className="sr-only">Not included</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card as="section" aria-labelledby="apply-heading" className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="apply-heading" className="type-section-title text-ink">
            What Premium needs
          </h2>
          <p className="type-caption mt-1 max-w-xl text-ink-muted">
            A source-of-funds declaration and a VIP or hospitality ticket. A compliance officer approves each application.
          </p>
        </div>
        {pending ? (
          <Badge tone="warning" icon={<Hourglass aria-hidden="true" />}>
            Pending review (demo)
          </Badge>
        ) : (
          <Button onClick={() => setApplying(true)}>
            <Crown aria-hidden="true" />
            Start demo application
          </Button>
        )}
      </Card>

      <Dialog
        open={applying}
        onClose={() => setApplying(false)}
        dismissible={!isSubmitting}
        title="Apply for Premium (demo)"
        description="Your answers stay in this browser and aren't sent anywhere."
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField id="source-of-funds" label="Main source of funds for this trip" error={errors.sourceOfFunds?.message}>
            <Select
              id="source-of-funds"
              defaultValue=""
              invalid={Boolean(errors.sourceOfFunds)}
              aria-describedby={describedBy("source-of-funds", false, errors.sourceOfFunds)}
              {...register("sourceOfFunds")}
            >
              <option value="" disabled>
                Choose one
              </option>
              {SOURCES_OF_FUNDS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormField>
          <div>
            <Checkbox
              id="has-ticket"
              label="I hold a VIP or hospitality ticket"
              description="In the planned service you'd add the ticket so it can be verified with the issuer."
              aria-invalid={errors.hasTicket ? true : undefined}
              aria-describedby={describedBy("has-ticket", false, errors.hasTicket)}
              {...register("hasTicket")}
            />
            <FormError id="has-ticket-error" message={errors.hasTicket?.message} />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setApplying(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} loadingLabel="Submitting…">
              Submit for review
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirmCancel}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          setPremiumApplication(false);
          setConfirmCancel(false);
          toast({ tone: "info", title: "Application withdrawn" });
        }}
        title="Withdraw your application?"
        description="Your demo Premium application will be removed."
        confirmLabel="Withdraw"
        tone="danger"
      />
    </>
  );
}
