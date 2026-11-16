import type { Metadata } from "next";
import { ChangePinForm } from "@/components/account/change-pin-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Change PIN" };

/** Demo app-PIN management. */
export default function ChangePinPage() {
  return (
    <>
      <PageHeader
        title="Change app PIN"
        description="Your app PIN can unlock payments when Face ID or fingerprint isn't available."
        breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Change PIN" }]}
      />
      <DemoNotice className="mb-6">
        Demo only. Never enter a real bank card PIN. PINs typed here are checked in memory and discarded — they are not saved or sent anywhere.
      </DemoNotice>
      <Card className="max-w-form">
        <ChangePinForm />
      </Card>
    </>
  );
}
