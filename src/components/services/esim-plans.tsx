"use client";

import { CheckCircle2, Info, Signal, Smartphone, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { DetailRow } from "@/components/ui/misc";
import { AccordionItem } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/dates";
import { foreignToRwf, formatRate, getRateMilli } from "@/lib/fx";
import { formatRwf, formatUsd } from "@/lib/money";
import { DEMO_DATA_PLANS } from "@/lib/mock-data/directory";
import { SAMPLE_RATE_BOARD } from "@/lib/mock-data/rates";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import type { DataPlan } from "@/types/service";
import type { Transaction } from "@/types/transaction";

const PURCHASE_DELAY_MS = 1_200;

/** Human-readable data allowance, e.g. 5120 → "5 GB". */
function formatData(megabytes: number): string {
  return megabytes >= 1024 ? `${Math.round(megabytes / 1024)} GB` : `${megabytes} MB`;
}

type Purchase = { plan: DataPlan; status: "review" | "processing" } | { plan: DataPlan; status: "done"; transaction: Transaction };

/**
 * Visitor Data (Option 1 roaming eSIM, UR-24 – UR-26) demo: illustrative plans
 * paid from the wallet at the sample rate. Purchases are recorded, but no
 * eSIM is provisioned, installed or activated.
 */
export function EsimPlans() {
  const { wallet, transactions } = useDemoStore();
  const { recordTransaction } = useDemoActions();
  const toast = useToast();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const usdRate = getRateMilli(SAMPLE_RATE_BOARD, "USD");
  const latestPlan = useMemo(() => transactions.find((transaction) => transaction.type === "esim_purchase" && transaction.status === "completed"), [transactions]);

  async function confirm() {
    if (!purchase || purchase.status !== "review") return;
    const { plan } = purchase;
    const priceRwf = foreignToRwf(plan.priceUsdMinor, "USD", usdRate);
    setPurchase({ plan, status: "processing" });
    await new Promise((resolve) => setTimeout(resolve, PURCHASE_DELAY_MS));
    const transaction = recordTransaction(
      {
        type: "esim_purchase",
        status: "completed",
        title: `${plan.name} data plan`,
        category: "connectivity",
        counterparty: { name: "Visitor Data (demo)", kind: "provider" },
        walletAmountRwf: -priceRwf,
        fxRateMilli: usdRate,
        note: `${formatData(plan.dataMb)} · ${plan.validityDays} days · plan price ${formatUsd(plan.priceUsdMinor)} at the sample rate. Demo purchase — no eSIM was provisioned.`,
      },
      { kind: "product", title: "Demo data plan recorded", body: `${plan.name}: not activated — needs a provider integration.` },
    );
    toast({ tone: "info", title: "Demo purchase recorded", description: "No eSIM was installed or activated." });
    setPurchase({ plan, status: "done", transaction });
  }

  const reviewPriceRwf = purchase ? foreignToRwf(purchase.plan.priceUsdMinor, "USD", usdRate) : 0;
  const insufficient = purchase?.status === "review" && reviewPriceRwf > wallet.balanceRwf;

  return (
    <div className="space-y-6">
      {latestPlan ? (
        <Card as="section" aria-labelledby="current-plan-heading">
          <CardHeader id="current-plan-heading" title="Your data" action={<DemoBadge />} />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-strong" aria-hidden="true">
              <Signal className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{latestPlan.title}</p>
              <p className="type-caption text-ink-muted">Purchased {formatDate(latestPlan.createdAt)} · {latestPlan.reference}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="neutral">Not installed</Badge>
                <Badge tone="neutral">Usage unavailable</Badge>
              </div>
            </div>
          </div>
          <p className="type-caption mt-4 text-ink-subtle">
            Data remaining and validity would come from the eSIM partner. This demo has no provider connection.
          </p>
        </Card>
      ) : null}

      <section aria-labelledby="plans-heading">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="plans-heading" className="type-section-title text-ink">
            Roaming data plans
          </h2>
          <p className="type-caption text-ink-muted">Illustrative prices · paid from your wallet at {formatRate("USD", usdRate)} (sample)</p>
        </div>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {DEMO_DATA_PLANS.map((plan) => {
            const priceRwf = foreignToRwf(plan.priceUsdMinor, "USD", usdRate);
            return (
              <li key={plan.id}>
                <Card className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="type-section-title text-ink">{plan.name}</h3>
                    <DemoBadge label="Sample" />
                  </div>
                  {/* Data allowance hero */}
                  <div className="mt-4 rounded-xl bg-brand-soft px-4 py-3 text-center">
                    <p className="type-amount text-3xl font-bold text-brand-strong">{formatData(plan.dataMb)}</p>
                    <p className="type-caption mt-0.5 text-ink-muted">{plan.validityDays} days validity · data only</p>
                  </div>
                  <p className="type-caption mt-3 flex-1 text-ink-muted">{plan.summary}</p>
                  {/* Pricing */}
                  <div className="mt-4 rounded-lg border border-border bg-canvas px-4 py-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="type-caption text-ink-muted">Price</span>
                      <span className="font-bold text-ink">{formatUsd(plan.priceUsdMinor)}</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="type-caption text-ink-muted">From wallet</span>
                      <span className="type-caption font-semibold text-ink-muted">≈ {formatRwf(priceRwf)}</span>
                    </div>
                  </div>
                  <Button className="mt-4" fullWidth onClick={() => setPurchase({ plan, status: "review" })}>
                    Choose {plan.name}
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Before you buy — collapsible secondary details */}
      <div className="rounded-lg border border-border bg-surface px-5">
        <AccordionItem title="Before you buy" name="esim-secondary">
          <ul className="space-y-3 text-sm text-ink-muted">
            <li className="flex gap-2.5">
              <Smartphone className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              Your phone must support eSIM and be carrier-unlocked. Not all phones support eSIM — check your device settings or manufacturer’s website.
            </li>
            <li className="flex gap-2.5">
              <Wifi className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              Install over Wi-Fi before you need the data. Activation requires a stable internet connection.
            </li>
            <li className="flex gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              Coverage, network details and activation steps would be confirmed by the eSIM partner — none are confirmed yet for this demo.
            </li>
            <li className="flex gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              Plans shown are illustrative. Actual data allowances, validity and prices are subject to provider confirmation.
            </li>
          </ul>
        </AccordionItem>
      </div>

      <Dialog
        open={purchase !== null}
        onClose={() => {
          if (purchase?.status !== "processing") setPurchase(null);
        }}
        dismissible={purchase?.status !== "processing"}
        title={purchase?.status === "done" ? "Purchase recorded (demo)" : `Review: ${purchase?.plan.name ?? ""} plan`}
        description={purchase?.status === "done" ? "Not activated — see below." : "Paid from your wallet balance."}
        footer={
          purchase?.status === "done" ? (
            <>
              <ButtonLink href={`/transactions/${purchase.transaction.id}`} variant="outline">
                View receipt
              </ButtonLink>
              <Button onClick={() => setPurchase(null)}>Done</Button>
            </>
          ) : purchase ? (
            <>
              <Button variant="outline" onClick={() => setPurchase(null)} disabled={purchase.status === "processing"}>
                Cancel
              </Button>
              <Button onClick={confirm} disabled={insufficient} loading={purchase.status === "processing"} loadingLabel="Recording purchase…">
                Confirm demo purchase
              </Button>
            </>
          ) : null
        }
      >
        {purchase && purchase.status !== "done" ? (
          <div className="space-y-4">
            <dl className="divide-y divide-border">
              <DetailRow label="Plan" value={`${formatData(purchase.plan.dataMb)} · ${purchase.plan.validityDays} days`} />
              <DetailRow label="Plan price" value={formatUsd(purchase.plan.priceUsdMinor)} />
              <DetailRow label="Sample rate" value={formatRate("USD", usdRate)} />
              <DetailRow label="Balance after" value={formatRwf(wallet.balanceRwf - reviewPriceRwf)} />
              <DetailRow label="Taken from wallet" value={formatRwf(reviewPriceRwf)} emphasis />
            </dl>
            {insufficient ? (
              <Alert tone="danger" title="Not enough balance">
                Top up your wallet to buy this plan.
              </Alert>
            ) : null}
            <Alert tone="warning">Demo only: the purchase is recorded in this browser, but no eSIM is provisioned or installed.</Alert>
          </div>
        ) : null}
        {purchase?.status === "done" ? (
          <div className="space-y-4" role="status">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
              <p className="type-section-title mt-3 text-ink">{purchase.plan.name} recorded</p>
              <p className="type-caption text-ink-muted">Reference {purchase.transaction.reference}</p>
            </div>
            <Alert tone="info" title="Activation isn't available">
              Installing and activating an eSIM needs a real eSIM partner integration. Nothing was installed on your device.
            </Alert>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
