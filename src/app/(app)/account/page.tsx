import type { Metadata } from "next";
import { ProfileView } from "@/components/account/profile-view";

export const metadata: Metadata = { title: "Profile" };

/** Account home: profile and preferences. */
export default function AccountPage() {
  return <ProfileView />;
}
