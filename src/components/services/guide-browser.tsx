"use client";

import { SearchX } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { SearchInput } from "@/components/ui/form-controls";
import type { GuideSection } from "@/types/service";

/** Returns the sections (with only matching steps/FAQs) that contain the query. */
function filterSections(sections: readonly GuideSection[], query: string): GuideSection[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...sections];
  const matches = (text: string) => text.toLowerCase().includes(needle);
  return sections.flatMap((section) => {
    const sectionHit = matches(section.title) || matches(section.summary);
    const steps = section.steps?.filter((step) => sectionHit || matches(step.title) || matches(step.body));
    const faqs = section.faqs?.filter((faq) => sectionHit || matches(faq.question) || matches(faq.answer));
    return sectionHit || (steps?.length ?? 0) > 0 || (faqs?.length ?? 0) > 0 ? [{ ...section, steps, faqs }] : [];
  });
}

interface GuideBrowserProps {
  id: string;
  sections: readonly GuideSection[];
  searchLabel: string;
  searchPlaceholder: string;
}

/**
 * Searchable step-by-step guide. Each section is a card with numbered steps
 * and expandable FAQs; search narrows to matching sections, steps and FAQs.
 */
export function GuideBrowser({ id, sections, searchLabel, searchPlaceholder }: GuideBrowserProps) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const visible = useMemo(() => filterSections(sections, deferred), [sections, deferred]);

  return (
    <div className="space-y-6">
      <SearchInput id={`${id}-search`} label={searchLabel} placeholder={searchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} />
      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "section" : "sections"} shown
      </p>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SearchX />}
            title="Nothing matches that search"
            description="Try a simpler word, like “card”, “extend” or “dispute”."
            action={
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {visible.map((section) => (
            <Card key={section.id} as="section" aria-labelledby={`${id}-${section.id}`}>
              <h2 id={`${id}-${section.id}`} className="type-section-title text-ink">
                {section.title}
              </h2>
              <p className="type-caption mt-1 text-ink-muted">{section.summary}</p>
              {section.steps && section.steps.length > 0 ? (
                <ol className="mt-5 space-y-4">
                  {section.steps.map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-strong"
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{step.title}</p>
                        <p className="type-caption mt-0.5 text-ink-muted">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
              {section.faqs && section.faqs.length > 0 ? (
                <Accordion className="mt-5 bg-canvas">
                  {section.faqs.map((faq) => (
                    <AccordionItem key={faq.id} title={faq.question}>
                      {faq.answer}
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
