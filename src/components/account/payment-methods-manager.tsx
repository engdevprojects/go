"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/feedback-states";
import { describedBy, FormField, Input, Select } from "@/components/ui/form-controls";
import { DemoNotice } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/dates";
import { describeMethod, fictionalLast4, PAYMENT_BRAND_LABELS } from "@/lib/payment-methods";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { paymentMethodSchema, type PaymentMethodValues } from "@/lib/validation/account";
import type { PaymentMethod } from "@/types/payment-method";

/**
 * Demo top-up methods: list, set default, remove (with confirmation), and add.
 * Adding asks only for a type and nickname — the demo invents a masked
 * suffix and never collects card numbers, expiry dates or security codes.
 */
export function PaymentMethodsManager() {
  const { data } = useDemoStore();
  const { addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = useDemoActions();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<PaymentMethod | null>(null);
  const methods = data.paymentMethods;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentMethodValues>({ resolver: zodResolver(paymentMethodSchema), defaultValues: { brand: "visa", nickname: "" } });

  async function onAdd(values: PaymentMethodValues) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const created = addPaymentMethod({ brand: values.brand, nickname: values.nickname, last4: fictionalLast4(methods) });
    toast({ tone: "success", title: "Demo method added", description: describeMethod(created) });
    reset();
    setAdding(false);
  }

  function confirmRemove() {
    if (!removing) return;
    removePaymentMethod(removing.id);
    toast({ tone: "info", title: "Method removed", description: removing.nickname });
    setRemoving(null);
  }

  return (
    <>
      <PageHeader
        title="Payment methods"
        description="Cards and wallets you top up with."
        breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Payment methods" }]}
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" />
            Add method
          </Button>
        }
      />
      <DemoNotice className="mb-6">Methods are fictional and masked. Prepaid and gift cards would be blocked in the planned service.</DemoNotice>

      <Card padding="none">
        {methods.length === 0 ? (
          <EmptyState
            icon={<CreditCard />}
            title="No saved payment methods"
            description="Add a demo method to try top-ups."
            action={
              <Button onClick={() => setAdding(true)}>
                <Plus aria-hidden="true" />
                Add method
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {methods.map((method) => (
              <li key={method.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-strong" aria-hidden="true">
                    <CreditCard className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                      {method.nickname}
                      {method.isDefault ? <Badge tone="brand">Default</Badge> : null}
                    </p>
                    <p className="type-caption text-ink-muted">
                      {describeMethod(method)} · added {formatDate(method.addedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault ? (
                    <Button variant="ghost" size="sm" onClick={() => setDefaultPaymentMethod(method.id)}>
                      <Star aria-hidden="true" />
                      Make default
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => setRemoving(method)} aria-label={`Remove ${method.nickname}`}>
                    <Trash2 aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card as="section" aria-labelledby="pm-security-heading" className="mt-6">
        <CardHeader id="pm-security-heading" title="How card details are handled (planned)" />
        <p className="type-body text-ink-muted">
          In the planned service you&apos;d enter card details in the card acquirer&apos;s secure hosted fields, protected by 3-D Secure. The wallet would
          keep only a token and the last four digits.
        </p>
      </Card>

      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        title="Add a demo payment method"
        description="We'll create a fictional, masked method — no card details needed."
        dismissible={!isSubmitting}
      >
        <form onSubmit={handleSubmit(onAdd)} noValidate className="space-y-4">
          <FormField id="pm-brand" label="Type" error={errors.brand?.message}>
            <Select id="pm-brand" invalid={Boolean(errors.brand)} {...register("brand")}>
              {Object.entries(PAYMENT_BRAND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="pm-nickname" label="Nickname" error={errors.nickname?.message} hint="For example “Work Visa”.">
            <Input id="pm-nickname" autoComplete="off" invalid={Boolean(errors.nickname)} aria-describedby={describedBy("pm-nickname", true, errors.nickname)} {...register("nickname")} />
          </FormField>
          <Alert tone="info">Never enter a real card number here — this form doesn&apos;t ask for one.</Alert>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setAdding(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} loadingLabel="Adding…">
              Add method
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
        title="Remove this method?"
        description={removing ? `${removing.nickname} (${describeMethod(removing)}) will be removed from this demo.` : ""}
        confirmLabel="Remove"
        tone="danger"
      />
    </>
  );
}
