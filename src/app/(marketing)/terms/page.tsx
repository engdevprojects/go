import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_DRAFT_DATE, TERMS_SECTIONS } from "@/lib/content/legal";

export const metadata: Metadata = { title: "Terms of Service (draft)" };

/** Public draft Terms of Service. */
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-marketing px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader title="Terms of Service" description="Draft terms prepared for the product demonstration." />
      <LegalDocument sections={TERMS_SECTIONS} updatedAt={LEGAL_DRAFT_DATE} />
    </div>
  );
}