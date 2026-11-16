import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { MobileMoneyFlow } from "@/components/services/mobile-money-flow";
import { DemoNotice } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Mobile Money" };

/** Send to MTN MoMo / Airtel Money numbers (demo). */
export default function MobileMoneyPage() {
  return (
    <>
      <PageHeader
        title="Mobile Money"
        description="Send francs from your wallet to someone's MTN MoMo or Airtel Money number. The recipient's name is checked before you send."
        breadcrumbs={[{ label: "Services", href: "/services" }, { label: "Mobile Money" }]}
      />
      <DemoNotice className="mb-6">Simulated transfers with fictional recipients. No provider integration exists and no real transfer is made.</DemoNotice>
      <MobileMoneyFlow />
    </>
  );
}
