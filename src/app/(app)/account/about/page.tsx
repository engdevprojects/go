import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { AboutContent } from "@/components/legal/about-content";

export const metadata: Metadata = { title: "About" };

/** About the product, inside the account area. */
export default function AccountAboutPage() {
  return (
    <>
      <PageHeader title="About" breadcrumbs={[{ label: "Account", href: "/account" }, { label: "About" }]} />
      <AboutContent legalBase="/account" />
    </>
  );
}