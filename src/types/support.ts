/** Categories for the Report a Problem form. */
export type ProblemCategory = "payment" | "top_up" | "exchange" | "data_esim" | "account" | "app_issue" | "other";

/** A support message or problem report recorded in this browser only. */
export interface SupportRequest {
  reference: string;
  kind: "contact" | "problem";
  subject: string;
  category?: ProblemCategory;
  /** Optional related transaction reference. */
  transactionReference?: string;
  createdAt: string;
  /** Always local in the demo — nothing is sent anywhere. */
  status: "recorded_locally";
}
