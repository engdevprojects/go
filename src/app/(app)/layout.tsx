import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

/** Layout for every signed-in route: navigation shell + demo session guard. */
export default function SignedInLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
