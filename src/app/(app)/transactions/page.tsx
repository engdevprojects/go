import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DemoNotice } from "@/components/ui/misc";
import { TransactionExplorer } from "@/components/transactions/transaction-explorer";
import { TRANSACTION_GROUP_FILTERS, type TransactionGroupFilter } from "@/lib/ledger";

export const metadata: Metadata = { title: "Transactions" };

interface TransactionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Narrows an untrusted `?group=` value to a known filter. */
function parseGroup(value: string | string[] | undefined): TransactionGroupFilter {
  const candidate = Array.isArray(value) ? value[0] : value;
  return TRANSACTION_GROUP_FILTERS.find((group) => group.value === candidate)?.value ?? "all";
}

/** Transaction history page. */
export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const initialGroup = parseGroup((await searchParams).group);
  return (
    <>
      <PageHeader
        title="Transactions"
        description="Every top-up, payment, tip, transfer and fee on your wallet."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Transactions" }]}
      />
      <DemoNotice className="mb-6">Sample transactions with demo references (DEMO-…). Anything you add in this browser appears here too.</DemoNotice>
      <TransactionExplorer initialGroup={initialGroup} />
    </>
  );
}
