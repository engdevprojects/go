"use client";

import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/feedback-states";

/**
 * Recoverable error boundary for signed-in pages. Shows a friendly message
 * and a retry; technical details go to the console only (no user data).
 */
export default function SignedInError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Page error", error.digest ?? error.name);
  }, [error]);

  return (
    <Card>
      <ErrorState
        title="This page couldn't be shown"
        description="Something unexpected happened while loading this demo page. Nothing was charged or sent."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={reset}>
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
            <ButtonLink href="/dashboard" variant="outline">
              Go to dashboard
            </ButtonLink>
          </div>
        }
      />
    </Card>
  );
}
