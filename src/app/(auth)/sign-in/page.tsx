import { Fingerprint } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { DemoNotice } from "@/components/ui/misc";
import { safeInternalPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Sign in" };

interface SignInPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Sign-in entry. The form is a client island; the rest is server-rendered. */
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const next = safeInternalPath((await searchParams).next);
  return (
    <div>
      <h1 className="type-page-title text-ink">Sign in to your wallet</h1>
      <p className="type-body mt-2 text-ink-muted">Enter your email and we&apos;ll ask for a 6-digit code to confirm it&apos;s you.</p>
      <DemoNotice className="mt-6">
        This is a demo. No email is sent, no account is created, and there&apos;s no password. You&apos;ll be shown the demo code on the next screen.
      </DemoNotice>
      <div className="mt-6">
        <SignInForm next={next} />
      </div>
      <p className="type-caption mt-6 flex items-start gap-2 text-ink-subtle">
        <Fingerprint className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        In the mobile app, sign-in also uses your device passkey. Passkeys aren&apos;t simulated on the web.
      </p>
      <p className="type-caption mt-8 text-ink-muted">
        <Link href="/" className="focus-ring rounded-sm font-medium text-brand-strong hover:underline">
          ← Back to the home page
        </Link>
      </p>
    </div>
  );
}
