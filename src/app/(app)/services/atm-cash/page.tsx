import { redirect } from "next/navigation";

/** ATM & Cash is no longer a main navigation destination. Redirect to services hub. */
export default function AtmCashPage() {
  redirect("/services");
}
