import { redirect } from "next/navigation";

/** Refund Guide is removed as a separate page. Refund action lives in the Wallet. */
export default function RefundGuidePage() {
  redirect("/wallet");
}
