import { FileText, Lock } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-logo";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DetailRow } from "@/components/ui/misc";
import { APP_VERSION, OPERATOR_NAME, PRODUCT_NAME } from "@/lib/config/product";

/**
 * About content shared by the public and account routes. States only
 * established project information and the demo's status.
 * @param legalBase Path prefix for the legal links ("" for public, "/account" in the app).
 */
export function AboutContent({ legalBase }: { legalBase: "" | "/account" }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Card as="section" aria-labelledby="about-heading" padding="lg">
        <div className="flex items-center gap-4">
          <BrandMark className="size-16" alt="GO logo" />
          <div>
            <h2 id="about-heading" className="type-section-title text-ink">
              {PRODUCT_NAME}
            </h2>
            <p className="type-caption text-ink-muted">Version {APP_VERSION}</p>
          </div>
        </div>
        <p className="type-body mt-6 text-ink-muted">
          A visitor wallet concept for international visitors to Rwanda: one place to load francs from a card, see exchange costs up front, pay and
          tip merchants through eKash, get roaming data, and find practical guidance for a stay.
        </p>
        <p className="type-body mt-3 text-ink-muted">
          This website is a demonstration for product review. It uses sample data and simulated actions only, and it isn&apos;t connected to any
          bank, payment provider, identity provider or mobile network.
        </p>
        <dl className="mt-6 divide-y divide-border border-t border-border">
          <DetailRow label="Associated company" value={OPERATOR_NAME} />
          <DetailRow label="Status" value="Demo · not a live service" />
          <DetailRow label="Planned pilot" value="Closed pilot, April 2027 (per requirements, subject to approval)" />
          <DetailRow label="Planned languages" value="English and French" />
        </dl>
      </Card>

      <div className="space-y-6">
        <Card as="section" aria-labelledby="regulatory-heading">
          <CardHeader id="regulatory-heading" title="Important" />
          <p className="type-body text-ink-muted">
            Nothing here means the service is licensed, approved by a regulator, or integrated with any provider. Figures follow the draft
            requirements and remain subject to regulator and partner approval.
          </p>
        </Card>
        <Card as="section" aria-labelledby="legal-links-heading">
          <CardHeader id="legal-links-heading" title="Documents" />
          <div className="grid gap-2">
            <ButtonLink href={`${legalBase}/terms`} variant="outline" fullWidth>
              <FileText aria-hidden="true" />
              Terms of Service (draft)
            </ButtonLink>
            <ButtonLink href={`${legalBase}/privacy`} variant="outline" fullWidth>
              <Lock aria-hidden="true" />
              Privacy Policy (draft)
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
