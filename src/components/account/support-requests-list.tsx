"use client";

import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { formatDateTime } from "@/lib/dates";
import { useDemoStore } from "@/lib/store/demo-store";
import type { SupportRequest } from "@/types/support";

/** Lists support requests of one kind recorded in this browser. */
export function SupportRequestsList({ kind, title }: { kind: SupportRequest["kind"]; title: string }) {
  const { data } = useDemoStore();
  const requests = data.supportRequests.filter((request) => request.kind === kind);

  return (
    <Card as="section" aria-labelledby={`${kind}-requests-heading`}>
      <CardHeader id={`${kind}-requests-heading`} title={title} description="Saved in this browser only" />
      {requests.length === 0 ? (
        <EmptyState icon={<Inbox />} title="Nothing yet" description="Anything you submit here will be listed with its demo reference." className="py-8" />
      ) : (
        <ul className="divide-y divide-border">
          {requests.map((request) => (
            <li key={request.reference} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{request.subject}</p>
                <Badge tone="neutral">Not sent (demo)</Badge>
              </div>
              <p className="type-caption mt-0.5 text-ink-muted">
                {request.reference} · {formatDateTime(request.createdAt)}
                {request.transactionReference ? ` · ${request.transactionReference}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
