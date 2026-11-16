import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_DRAFT_DATE, PRIVACY_SECTIONS } from "@/lib/content/legal";

export const metadata: Metadata = { title: "Privacy Policy (draft)" };

/** Public draft Privacy Policy. */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-marketing px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader title="Privacy Policy" description="What this demo stores, and what the service plans to do." />
      <LegalDocument sections={PRIVACY_SECTIONS} updatedAt={LEGAL_DRAFT_DATE} />
    </div>
  );
}