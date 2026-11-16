import type { Metadata } from "next";
import { ContactSupportForm } from "@/components/account/contact-support-form";
import { SupportRequestsList } from "@/components/account/support-requests-list";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Contact support" };

/** Contact form (recorded locally — no backend). */
export default function ContactSupportPage() {
  return (
    <>
      <PageHeader
        title="Contact support"
        description="Send a message to the support team."
        breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Contact support" }]}
      />
      <DemoNotice className="mb-6">No messages are sent from this demo. Support contact details haven&apos;t been published yet, so none are shown.</DemoNotice>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card as="section" aria-labelledby="contact-form-heading">
          <CardHeader id="contact-form-heading" title="Your message" />
          <ContactSupportForm />
        </Card>
        <SupportRequestsList kind="contact" title="Your messages" />
      </div>
    </>
  );
}
