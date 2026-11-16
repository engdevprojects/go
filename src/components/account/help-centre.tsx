"use client";

import { Flag, MessageSquare, SearchX } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback-states";
import { DemoNotice } from "@/components/ui/misc";
import { SearchInput } from "@/components/ui/form-controls";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { HELP_CATEGORIES } from "@/lib/mock-data/guides";

const CATEGORY_OPTIONS = [{ value: "all", label: "All topics" }, ...HELP_CATEGORIES.map((category) => ({ value: category.id, label: category.title }))];

/** Searchable, categorised FAQ with routes to Contact Support and Report a Problem. */
export function HelpCentre() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const deferred = useDeferredValue(search);

  const groups = useMemo(() => {
    const needle = deferred.trim().toLowerCase();
    return HELP_CATEGORIES.filter((group) => category === "all" || group.id === category)
      .map((group) => ({
        ...group,
        faqs: group.faqs.filter((faq) => !needle || `${faq.question} ${faq.answer}`.toLowerCase().includes(needle)),
      }))
      .filter((group) => group.faqs.length > 0);
  }, [deferred, category]);
  const count = groups.reduce((total, group) => total + group.faqs.length, 0);

  return (
    <>
      <PageHeader
        title="Help Centre"
        description="Answers to common questions about the wallet."
        breadcrumbs={[{ label: "Account", href: "/account" }, { label: "Help Centre" }]}
      />
      <DemoNotice className="mb-4">Answers describe the planned service from the pilot requirements. This website is a demo and doesn&apos;t provide these services.</DemoNotice>
      <div className="space-y-4">
        <SearchInput id="help-search" label="Search help articles" placeholder="Search, e.g. “fee”, “eSIM” or “refund”" value={search} onChange={(event) => setSearch(event.target.value)} />
        <SegmentedControl label="Topic" hideLabel name="help-topic" size="sm" value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />
        <p className="sr-only" aria-live="polite">
          {count} {count === 1 ? "article" : "articles"} found
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {groups.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="No matching help articles"
              description="Try different words, or ask our support team."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => { setSearch(""); setCategory("all"); }}>
                    Clear search
                  </Button>
                  <ButtonLink href="/account/contact-support">Contact support</ButtonLink>
                </div>
              }
            />
          </Card>
        ) : (
          groups.map((group) => (
            <section key={group.id} aria-labelledby={`help-${group.id}`}>
              <h2 id={`help-${group.id}`} className="type-section-title mb-3 text-ink">
                {group.title}
              </h2>
              <Accordion>
                {group.faqs.map((faq) => (
                  <AccordionItem key={faq.id} title={faq.question}>
                    {faq.answer}
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))
        )}
      </div>

      <Card className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="type-card-title text-ink">Still need help?</h2>
          <p className="type-caption text-ink-muted">Message support, or report a problem with a specific transaction.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/account/contact-support" variant="secondary">
            <MessageSquare aria-hidden="true" />
            Contact support
          </ButtonLink>
          <ButtonLink href="/account/report-problem" variant="outline">
            <Flag aria-hidden="true" />
            Report a problem
          </ButtonLink>
        </div>
      </Card>
    </>
  );
}
