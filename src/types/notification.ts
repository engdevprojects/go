/** Kinds of in-app notification. */
export type NotificationKind = "payment" | "top_up" | "security" | "verification" | "expiry" | "product";

/** An in-app notification. Read state lives in the demo store, not here. */
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  /** Optional in-app destination for the notification. */
  href?: string;
}

/** A notification joined with its read state for display. */
export interface NotificationView extends AppNotification {
  read: boolean;
}
