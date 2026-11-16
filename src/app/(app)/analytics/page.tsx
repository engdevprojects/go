import type { Metadata } from "next";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export const metadata: Metadata = { title: "Analytics" };

/** Spending analytics derived from the demo ledger. */
export default function AnalyticsPage() {
  return <AnalyticsView />;
}
