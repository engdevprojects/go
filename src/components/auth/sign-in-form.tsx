"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { describedBy, FormField, Input } from "@/components/ui/form-controls";
import { useDemoActions, useDemoStore } from "@/lib/store/demo-store";
import { signInSchema, type SignInValues } from "@/lib/validation/auth";

/** Simulated network latency so loading states are visible in the demo. */
const SIMULATED_DELAY_MS = 700;

/**
 * Demo sign-in: validates an email, records a pending sign-in (email only),
 * and moves to code verification. No email is sent and no account exists.
 * @param next Validated internal path to open after verification.
 */
export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const { hydrated, data } = useDemoStore();
  const { startSignIn } = useDemoActions();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: "" } });

  async function onSubmit(values: SignInValues) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    startSignIn(values.email);
    router.push(`/verify?next=${encodeURIComponent(next)}`);
  }

  if (hydrated && data.session) {
    return (
      <Alert tone="success" title={`You're signed in as ${data.session.email}`} action={<ButtonLink href={next}>Continue to the demo</ButtonLink>}>
        Your demo session is still active in this browser.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField id="email" label="Email address" error={errors.email?.message} hint="Use any address — this demo never sends email.">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="name@example.com"
          leading={<Mail aria-hidden="true" />}
          invalid={Boolean(errors.email)}
          aria-describedby={describedBy("email", true, errors.email)}
          {...register("email")}
        />
      </FormField>
      <Button type="submit" size="lg" fullWidth loading={isSubmitting} loadingLabel="Preparing your code…">
        Continue
        <ArrowRight aria-hidden="true" />
      </Button>
    </form>
  );
}
