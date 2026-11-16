import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Dashboard" };

/** Signed-in home. Data is per-browser demo state, so the view is a client component. */
export default function DashboardPage() {
  return <DashboardView />;
}
