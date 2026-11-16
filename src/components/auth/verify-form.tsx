"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-controls";
import { OtpInput } from "@/components/ui/otp-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCountdown, secondsLeft, useRealNow } from "@/hooks/use-real-now";
import { DEMO_OTP_CODE, OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS, OTP_VALIDITY_MINUTES } from "@/lib/config/product";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { otpSchema, type OtpValues } from "@/lib/validation/auth";

const SIMULATED_DELAY_MS = 600;

/**
 * Demo email-code verification (UR-01): 6 digits, valid for 10 minutes,
 * resend allowed after a short cooldown. The typed code lives only in form
 * state and is compared in memory against the documented demo code.
 */
export function VerifyForm({ next }: { next: string }) {
  const router = useRouter();
  const toast = useToast();
  const nowMs = useRealNow();
  const { hydrated, data } = useDemoStore();
  const { completeSignIn, resendCode } = useDemoActions();
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OtpValues>({ resolver: zodResolver(otpSchema), defaultValues: { code: "" } });

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const pending = data.pendingSignIn;
  if (!pending) {
    return (
      <Alert tone="info" title="Start by entering your email" action={<ButtonLink href={`/sign-in?next=${encodeURIComponent(next)}`}>Go to sign in</ButtonLink>}>
        There&apos;s no verification in progress in this browser.
      </Alert>
    );
  }

  const expiresIn = secondsLeft(pending.codeSentAtMs + OTP_VALIDITY_MINUTES * 60_000, nowMs);
  const resendIn = secondsLeft(pending.codeSentAtMs + OTP_RESEND_COOLDOWN_SECONDS * 1000, nowMs);
  const expired = nowMs !== 0 && expiresIn === 0;

  async function onSubmit(values: OtpValues) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    if (expired) {
      setError("code", { message: "This code has expired. Request a new one." });
      return;
    }
    if (values.code !== DEMO_OTP_CODE) {
      setError("code", { message: "That code isn't right. Check the digits and try again." });
      return;
    }
    completeSignIn();
    router.replace(next);
  }

  function handleResend() {
    resendCode();
    reset({ code: "" });
    toast({ tone: "info", title: "New demo code ready", description: `Use ${DEMO_OTP_CODE}. No email was sent.` });
  }

  return (
    <div className="space-y-6">
      <Alert tone="info" title={`Demo code: ${DEMO_OTP_CODE}`}>
        In the planned service the code is emailed to {pending.email}. Here, nothing is sent — use the demo code.
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <p id="code-label" className="text-sm font-medium text-ink">
            {OTP_LENGTH}-digit code
          </p>
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <OtpInput
                label={`${OTP_LENGTH}-digit verification code`}
                labelledBy="code-label"
                value={field.value}
                onChange={field.onChange}
                invalid={Boolean(errors.code)}
                disabled={isSubmitting}
                describedBy="code-error code-timer"
              />
            )}
          />
          <FormError id="code-error" message={errors.code?.message} />
          <p id="code-timer" className="type-caption text-ink-muted">
            {expired ? "The code has expired." : `Code expires in ${formatCountdown(expiresIn)}.`}
          </p>
        </div>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingLabel="Checking code…" disabled={expired}>
          Verify and continue
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <p className="type-caption text-ink-muted">Didn&apos;t get it?</p>
        <Button variant="ghost" size="sm" onClick={handleResend} disabled={resendIn > 0}>
          <RefreshCw aria-hidden="true" />
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </Button>
      </div>
    </div>
  );
}
