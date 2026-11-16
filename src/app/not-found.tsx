import { Compass } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

/** Global 404 page. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <BrandLogo className="mb-10" />
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand-strong" aria-hidden="true">
        <Compass className="size-6" />
      </div>
      <h1 className="type-page-title text-ink">We couldn&apos;t find that page</h1>
      <p className="type-body mt-2 max-w-md text-ink-muted">The link may be out of date, or the page may not exist in this demo.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
