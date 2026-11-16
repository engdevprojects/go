import type { Metadata } from "next";
import { NotificationsList } from "@/components/account/notifications-list";

export const metadata: Metadata = { title: "Notifications" };

/** In-app notification centre. */
export default function NotificationsPage() {
  return <NotificationsList />;
}
