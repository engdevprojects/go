import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/account-nav";

/** Account area: persistent account navigation on large screens beside the page. */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <AccountNav />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
