import { FileWarning } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import type { LegalSection } from "@/lib/content/legal";
import { formatDate } from "@/lib/dates";

interface LegalDocumentProps {
  sections: readonly LegalSection[];
  updatedAt: string;
}

/**
 * Renders a draft legal document: a prominent "draft — needs legal review"
 * notice, an in-page table of contents, and numbered sections. Server
 * component; used by both the public and the account routes.
 */
export function LegalDocument({ sections, updatedAt }: LegalDocumentProps) {
  return (
    <div className="space-y-6">
      <Alert tone="warning" title="Draft — requires legal review before production use">
        <span className="inline-flex items-center gap-1.5">
          <FileWarning className="size-4" aria-hidden="true" />
          Last revised {formatDate(updatedAt)}. Not approved by counsel or any regulator.
        </span>
      </Alert>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="type-overline mb-2 text-ink-subtle">On this page</h2>
          <ol className="space-y-1.5 text-sm">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="focus-ring rounded-sm text-ink-muted hover:text-ink">
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <Card padding="lg" className="max-w-prose">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-24 not-first:mt-8">
              <h2 id={`${section.id}-heading`} className="type-section-title text-ink">
                {index + 1}. {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="type-body mt-3 text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </Card>
      </div>
    </div>
  );
}
