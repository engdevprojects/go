import type { Metadata } from "next";
import { ReportProblemForm } from "@/components/account/report-problem-form";
import { SupportRequestsList } from "@/components/account/support-requests-list";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Report a problem" };

interface ReportProblemPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Accepts only demo-reference-shaped values from the URL for prefilling. */
function parseReference(value: string | string[] | undefined): string {
  const candidate = (Array.isArray(value) ? value[0] : value)?.trim().toUpperCase() ?? "";
  return /^DEMO-\d{4}-\d{4}$/.test(candidate) ? candidate : "";
}

/** Problem report with review step (recorded locally — no backend). */
export default async function ReportProblemPage({ searchParams }: ReportProblemPageProps) {
  const initialReference = parseReference((await searchParams).ref);
  return (
    <>
      <PageHeader
        title="Report a problem"
        description="Tell us what went wrong. Linking a transaction helps support find it quickly."
        breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Report a problem" }]}
      />
      <DemoNotice className="mb-6">Reports are recorded in this browser with a demo reference. Nothing is sent and no dispute is opened.</DemoNotice>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card as="section" aria-labelledby="report-heading">
          <CardHeader id="report-heading" title="Problem details" />
          <ReportProblemForm initialReference={initialReference} />
        </Card>
        <SupportRequestsList kind="problem" title="Your reports" />
      </div>
    </>
  );
}
