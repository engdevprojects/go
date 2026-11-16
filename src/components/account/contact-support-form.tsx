"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { describedBy, FormField, Input, Select, Textarea } from "@/components/ui/form-controls";
import { useToast } from "@/components/ui/toast";
import { useDemoActions } from "@/lib/store/demo-store";
import { contactSupportSchema, type ContactSupportValues } from "@/lib/validation/support";
import type { SupportRequest } from "@/types/support";

const TOPICS: readonly { value: ContactSupportValues["topic"]; label: string }[] = [
  { value: "account", label: "My account" },
  { value: "payments", label: "Payments and tips" },
  { value: "top_ups", label: "Top-ups and exchange" },
  { value: "data", label: "Data and eSIM" },
  { value: "other", label: "Something else" },
];

const MESSAGE_LIMIT = 1000;

/**
 * Contact Support form. With no backend, the message is recorded in this
 * browser with a demo reference — and the visitor is told it wasn't sent.
 */
export function ContactSupportForm() {
  const { addSupportRequest } = useDemoActions();
  const toast = useToast();
  const [submitted, setSubmitted] = useState<SupportRequest | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactSupportValues>({
    resolver: zodResolver(contactSupportSchema),
    defaultValues: { subject: "", message: "", transactionReference: "" },
  });
  const message = useWatch({ control, name: "message" }) ?? "";

  async function onSubmit(values: ContactSupportValues) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const request = addSupportRequest({
      kind: "contact",
      subject: values.subject,
      transactionReference: values.transactionReference || undefined,
    });
    reset();
    setSubmitted(request);
    toast({ tone: "info", title: "Message recorded (demo)", description: request.reference });
  }

  return (
    <div className="space-y-5">
      {submitted ? (
        <Alert tone="success" live="polite" title={`Recorded with reference ${submitted.reference}`}>
          This demo has no support backend, so your message was <strong>not sent</strong> to anyone. In the planned service, it would create a ticket
          for the operations team.
        </Alert>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField id="topic" label="Topic" error={errors.topic?.message}>
          <Select id="topic" defaultValue="" invalid={Boolean(errors.topic)} aria-describedby={describedBy("topic", false, errors.topic)} {...register("topic")}>
            <option value="" disabled>
              Choose a topic
            </option>
            {TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="subject" label="Subject" error={errors.subject?.message}>
          <Input id="subject" autoComplete="off" maxLength={100} invalid={Boolean(errors.subject)} aria-describedby={describedBy("subject", false, errors.subject)} {...register("subject")} />
        </FormField>
        <FormField id="message" label="Message" error={errors.message?.message} hint={`${message.length}/${MESSAGE_LIMIT} characters. Don't include card numbers, PINs or codes.`}>
          <Textarea id="message" maxLength={MESSAGE_LIMIT} invalid={Boolean(errors.message)} aria-describedby={describedBy("message", true, errors.message)} {...register("message")} />
        </FormField>
        <FormField id="transactionReference" label="Transaction reference" optional error={errors.transactionReference?.message} hint="Found on the receipt, e.g. DEMO-0410-0015.">
          <Input
            id="transactionReference"
            autoComplete="off"
            placeholder="DEMO-0000-0000"
            invalid={Boolean(errors.transactionReference)}
            aria-describedby={describedBy("transactionReference", true, errors.transactionReference)}
            {...register("transactionReference")}
          />
        </FormField>
        <Button type="submit" loading={isSubmitting} loadingLabel="Recording…">
          <Send aria-hidden="true" />
          Send message
        </Button>
      </form>
    </div>
  );
}
