import type { Metadata } from "next";
import { PaymentMethodsManager } from "@/components/account/payment-methods-manager";

export const metadata: Metadata = { title: "Payment methods" };

/** Manage demo top-up methods. */
export default function PaymentMethodsPage() {
  return <PaymentMethodsManager />;
}
