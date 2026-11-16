import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { AboutContent } from "@/components/legal/about-content";

export const metadata: Metadata = { title: "About" };

/** Public About page. */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-marketing px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader title="About" description="What GO is, and what this demo is." />
      <AboutContent legalBase="" />
    </div>
  );
}