import type { Metadata } from "next";
import { UpgradeView } from "@/components/account/upgrade-view";

export const metadata: Metadata = { title: "Upgrade to Premium" };

/** Tier comparison and demo Premium application. */
export default function UpgradePage() {
  return <UpgradeView />;
}
