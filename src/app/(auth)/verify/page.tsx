import type { Metadata } from "next";
import Link from "next/link";
import { VerifyForm } from "@/components/auth/verify-form";
import { safeInternalPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Verify your email" };

interface VerifyPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Email-code verification step of the demo sign-in. */
export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const next = safeInternalPath((await searchParams).next);
  return (
    <div>
      <h1 className="type-page-title text-ink">Check your email</h1>
      <p className="type-body mt-2 mb-6 text-ink-muted">Enter the 6-digit code to confirm your email address.</p>
      <VerifyForm next={next} />
      <p className="type-caption mt-8 text-ink-muted">
        Wrong email?{" "}
        <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="focus-ring rounded-sm font-medium text-brand-strong hover:underline">
          Start again
        </Link>
      </p>
    </div>
  );
}
