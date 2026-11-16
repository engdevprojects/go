import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { EsimPlans } from "@/components/services/esim-plans";
import { DemoNotice } from "@/components/ui/misc";

export const metadata: Metadata = { title: "eSIM & Data" };

/** Roaming data plans (Option 1) paid from the wallet — demo. */
export default function EsimPage() {
  return (
    <>
      <PageHeader
        title="eSIM & Data"
        description="Stay connected with a roaming data eSIM, paid from your wallet. No local SIM needed."
        breadcrumbs={[{ label: "Services", href: "/services" }, { label: "eSIM & Data" }]}
      />
      <DemoNotice className="mb-6">
        Plans, prices and allowances are illustrative and not confirmed by any eSIM provider. No eSIM can be installed or activated from this demo.
      </DemoNotice>
      <EsimPlans />
    </>
  );
}
