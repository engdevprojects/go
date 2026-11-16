"use client";

import { useEffect } from "react";
import "./globals.css";

/** Last-resort error boundary when the root layout itself fails. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error", error.digest ?? error.name);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center px-4 text-center">
        <div>
          <h1 className="type-page-title text-ink">The demo hit an unexpected problem</h1>
          <p className="type-body mt-2 text-ink-muted">Nothing was charged or sent. Try loading the page again.</p>
          <button
            type="button"
            onClick={reset}
            className="focus-ring mt-6 inline-flex h-11 items-center rounded-md bg-brand px-4 text-sm font-semibold text-ink-inverse"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
