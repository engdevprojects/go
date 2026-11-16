import type { Metadata } from "next";
import { TransactionDetail } from "@/components/transactions/transaction-detail";

export const metadata: Metadata = { title: "Transaction details" };

interface TransactionPageProps {
  params: Promise<{ id: string }>;
}

/** Receipt page for one transaction (seeded or created in this browser). */
export default async function TransactionPage({ params }: TransactionPageProps) {
  const { id } = await params;
  return <TransactionDetail id={id} />;
}
