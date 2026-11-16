import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_DRAFT_DATE, PRIVACY_SECTIONS } from "@/lib/content/legal";

export const metadata: Metadata = { title: "Privacy Policy (draft)" };

/** Draft Privacy Policy inside the account area. */
export default function AccountPrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" description="What this demo stores, and what the service plans to do." breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Privacy Policy" }]} />
      <LegalDocument sections={PRIVACY_SECTIONS} updatedAt={LEGAL_DRAFT_DATE} />
    </>
  );
}