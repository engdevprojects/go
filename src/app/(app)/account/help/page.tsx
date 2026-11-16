import type { Metadata } from "next";
import { HelpCentre } from "@/components/account/help-centre";

export const metadata: Metadata = { title: "Help Centre" };

/** Searchable help articles. */
export default function HelpPage() {
  return <HelpCentre />;
}
