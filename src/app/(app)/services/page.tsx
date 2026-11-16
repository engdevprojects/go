import type { Metadata } from "next";
import { ServiceCard } from "@/components/finance/service-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { SERVICES } from "@/lib/mock-data/services";

export const metadata: Metadata = { title: "Services" };

/** Hub listing every visitor service, with an honest availability label on each. */
export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Services"
        description="Everything for your stay in one place. Labels show what each service can do in this demo."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Services" }]}
      />
      <ul className="mb-6 flex flex-wrap gap-2" aria-label="Label meanings">
        <li>
          <Badge tone="warning">Demo flow</Badge> <span className="type-caption text-ink-muted">simulated, uses sample data</span>
        </li>
        <li>
          <Badge tone="info">Guide</Badge> <span className="type-caption text-ink-muted">information only</span>
        </li>
        <li>
          <Badge tone="neutral">Not in pilot</Badge> <span className="type-caption text-ink-muted">explains what isn&apos;t offered yet</span>
        </li>
      </ul>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SERVICES.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </>
  );
}
