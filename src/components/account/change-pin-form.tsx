"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { describedBy, FormField, Input } from "@/components/ui/form-controls";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/dates";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { changePinSchema, type ChangePinValues } from "@/lib/validation/account";

const FIELDS: readonly { name: keyof ChangePinValues; label: string; autoComplete: string; hint?: string }[] = [
  { name: "currentPin", label: "Current app PIN", autoComplete: "current-password", hint: "In the demo any 6 digits are accepted here." },
  { name: "newPin", label: "New app PIN", autoComplete: "new-password", hint: "6 digits. Avoid repeated or sequential numbers." },
  { name: "confirmPin", label: "Confirm new PIN", autoComplete: "new-password" },
];

/**
 * Demo app-PIN change (UR-17 mentions an app PIN for unlocking payments).
 * PINs are validated in memory, then the form is cleared; only the time of
 * the change is recorded. Nothing resembling a banking PIN is stored.
 */
export function ChangePinForm() {
  const { data } = useDemoStore();
  const { recordPinChange } = useDemoActions();
  const toast = useToast();
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePinValues>({ resolver: zodResolver(changePinSchema), defaultValues: { currentPin: "", newPin: "", confirmPin: "" } });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 700));
    recordPinChange();
    reset({ currentPin: "", newPin: "", confirmPin: "" });
    setDone(true);
    toast({ tone: "success", title: "Demo PIN updated", description: "The PIN itself wasn't stored." });
  }

  return (
    <div className="space-y-5">
      {done ? (
        <Alert tone="success" live="polite" title="Your demo PIN was changed">
          In the app, your new PIN would unlock payments. Here, it was checked and then discarded.
        </Alert>
      ) : null}
      {data.pinChangedAt ? <p className="type-caption text-ink-muted">Last changed {formatDateTime(data.pinChangedAt)} (demo).</p> : null}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
        onChange={() => {
          if (done) setDone(false);
        }}
      >
        {FIELDS.map((field) => (
          <FormField key={field.name} id={field.name} label={field.label} hint={field.hint} error={errors[field.name]?.message}>
            <Input
              id={field.name}
              type={visible ? "text" : "password"}
              inputMode="numeric"
              autoComplete={field.autoComplete}
              maxLength={6}
              className="tabular tracking-[0.3em]"
              invalid={Boolean(errors[field.name])}
              aria-describedby={describedBy(field.name, field.hint, errors[field.name])}
              {...register(field.name)}
            />
          </FormField>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setVisible((value) => !value)} aria-pressed={visible}>
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {visible ? "Hide PINs" : "Show PINs"}
        </Button>
        <Button type="submit" fullWidth size="lg" loading={isSubmitting} loadingLabel="Updating…">
          {done ? <CheckCircle2 aria-hidden="true" /> : null}
          Update demo PIN
        </Button>
      </form>
    </div>
  );
}
