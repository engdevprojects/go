import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_DRAFT_DATE, TERMS_SECTIONS } from "@/lib/content/legal";

export const metadata: Metadata = { title: "Terms of Service (draft)" };

/** Draft Terms of Service inside the account area. */
export default function AccountTermsPage() {
  return (
    <>
      <PageHeader title="Terms of Service" description="Draft terms for the demo." breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Terms of Service" }]} />
      <LegalDocument sections={TERMS_SECTIONS} updatedAt={LEGAL_DRAFT_DATE} />
    </>
  );
}