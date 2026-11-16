import type { Metadata } from "next";
import { WalletView } from "@/components/wallet/wallet-view";

export const metadata: Metadata = { title: "Wallet & exchange" };

/** Wallet balance, top-up quotes and refund (convert-back) estimates. */
export default async function WalletPage({ searchParams }: { searchParams: Promise<{ direction?: string }> }) {
  const { direction } = await searchParams;
  const initialDirection = direction === "convert_back" ? "convert_back" : "top_up";
  return <WalletView initialDirection={initialDirection} />;
}
