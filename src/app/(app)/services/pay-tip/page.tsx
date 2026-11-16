import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PayTipFlow } from "@/components/services/pay-tip-flow";
import { DemoNotice } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Pay & Tip" };

/** eKash QR payments and tips (demo). */
export default function PayTipPage() {
  return (
    <>
      <PageHeader
        title="Pay & Tip"
        description="Scan a merchant's QR code or enter their code, check the name, add a tip, and pay in francs. Tips carry no visitor fee."
        breadcrumbs={[{ label: "Services", href: "/services" }, { label: "Pay & Tip" }]}
      />
      <DemoNotice className="mb-6">
        Only demo codes (rvw-demo:…) can be paid here — real eKash QR codes are rejected. Payments are simulated and recorded in this browser only.
      </DemoNotice>
      <PayTipFlow />
    </>
  );
}
