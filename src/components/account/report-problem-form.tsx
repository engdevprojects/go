"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Paperclip } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Checkbox, describedBy, FormField, Input, Select, Textarea } from "@/components/ui/form-controls";
import { DetailRow } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { problemReportSchema, type ProblemReportValues } from "@/lib/validation/support";
import type { ProblemCategory, SupportRequest } from "@/types/support";

const CATEGORIES: readonly { value: ProblemCategory; label: string }[] = [
  { value: "payment", label: "A payment or tip" },
  { value: "top_up", label: "A card top-up" },
  { value: "exchange", label: "Exchange rate or fees" },
  { value: "data_esim", label: "Data or eSIM" },
  { value: "account", label: "My account or verification" },
  { value: "app_issue", label: "Something not working in the app" },
  { value: "other", label: "Something else" },
];

/**
 * Report a Problem with a review step before submitting. Recorded locally
 * with a demo reference. Attachments aren't supported without a backend.
 * @param initialReference Transaction reference prefilled from `?ref=`.
 */
export function ReportProblemForm({ initialReference }: { initialReference: string }) {
  const { transactions } = useDemoStore();
  const { addSupportRequest } = useDemoActions();
  const toast = useToast();
  const [review, setReview] = useState<ProblemReportValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SupportRequest | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProblemReportValues>({
    resolver: zodResolver(problemReportSchema),
    defaultValues: { description: "", transactionReference: initialReference, happenedBefore: false },
  });
  const reference = useWatch({ control, name: "transactionReference" }) ?? "";
  const linked = transactions.find((transaction) => transaction.reference === reference.trim().toUpperCase());

  async function confirm() {
    if (!review) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const category = CATEGORIES.find((option) => option.value === review.category);
    const request = addSupportRequest({
      kind: "problem",
      subject: category?.label ?? "Problem report",
      category: review.category,
      transactionReference: review.transactionReference || undefined,
    });
    setSubmitting(false);
    setReview(null);
    setSubmitted(request);
    reset({ description: "", transactionReference: "", happenedBefore: false });
    toast({ tone: "info", title: "Report recorded (demo)", description: request.reference });
  }

  return (
    <div className="space-y-5">
      {submitted ? (
        <Alert tone="success" live="polite" title={`Report recorded: ${submitted.reference}`}>
          Keep this demo reference. No report was actually sent — the demo has no support backend.
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit((values) => setReview(values))} noValidate className="space-y-4">
        <FormField id="category" label="What's the problem about?" error={errors.category?.message}>
          <Select id="category" defaultValue="" invalid={Boolean(errors.category)} aria-describedby={describedBy("category", false, errors.category)} {...register("category")}>
            <option value="" disabled>
              Choose one
            </option>
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="report-reference" label="Transaction reference" optional error={errors.transactionReference?.message} hint={linked ? `Matches: ${linked.title}` : "From the receipt, e.g. DEMO-0410-0015."}>
          <Input
            id="report-reference"
            autoComplete="off"
            placeholder="DEMO-0000-0000"
            invalid={Boolean(errors.transactionReference)}
            aria-describedby={describedBy("report-reference", true, errors.transactionReference)}
            {...register("transactionReference")}
          />
        </FormField>
        <FormField id="description" label="What happened?" error={errors.description?.message} hint="Include what you expected and what you saw. Don't include card numbers, PINs or codes.">
          <Textarea id="description" maxLength={1000} invalid={Boolean(errors.description)} aria-describedby={describedBy("description", true, errors.description)} {...register("description")} />
        </FormField>
        <Checkbox id="happenedBefore" label="This has happened before" {...register("happenedBefore")} />
        <p className="type-caption flex items-start gap-2 text-ink-muted">
          <Paperclip className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Screenshots can&apos;t be attached in this demo because there&apos;s nowhere to send them.
        </p>
        <Button type="submit">Review report</Button>
      </form>

      <Dialog
        open={review !== null}
        onClose={() => setReview(null)}
        dismissible={!submitting}
        title="Review your report"
        description="Check the details, then submit."
        footer={
          <>
            <Button variant="outline" onClick={() => setReview(null)} disabled={submitting}>
              Edit
            </Button>
            <Button onClick={confirm} loading={submitting} loadingLabel="Submitting…">
              <CheckCircle2 aria-hidden="true" />
              Submit report
            </Button>
          </>
        }
      >
        {review ? (
          <div className="space-y-4">
            <dl className="divide-y divide-border">
              <DetailRow label="About" value={CATEGORIES.find((option) => option.value === review.category)?.label ?? review.category} />
              <DetailRow label="Transaction" value={review.transactionReference || "Not linked"} />
              <DetailRow label="Happened before" value={review.happenedBefore ? "Yes" : "No"} />
            </dl>
            <div>
              <p className="text-sm font-medium text-ink-muted">Description</p>
              <p className="type-body mt-1 rounded-md bg-surface-muted p-3 whitespace-pre-wrap text-ink">{review.description}</p>
            </div>
            {review.transactionReference && !linked ? (
              <Alert tone="warning">
                We couldn&apos;t find that reference in this browser.{" "}
                <Link href="/transactions" className="font-semibold text-brand-strong underline">
                  Check your transactions
                </Link>
                .
              </Alert>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
