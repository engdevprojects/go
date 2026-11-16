import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CardsOverview } from "@/components/services/cards-overview";
import { DemoNotice } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Cards" };

/** Linked top-up cards and the (unavailable) visitor card. */
export default function CardsPage() {
  return (
    <>
      <PageHeader
        title="Cards"
        description="The cards you top up with — and why there's no visitor card yet."
        breadcrumbs={[{ label: "Services", href: "/services" }, { label: "Cards" }]}
      />
      <DemoNotice className="mb-6">Card numbers here are fictional and masked. The demo never asks for a card number, expiry date or security code.</DemoNotice>
      <CardsOverview />
    </>
  );
}
