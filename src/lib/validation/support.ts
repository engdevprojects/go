import { z } from "zod";

const transactionReference = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .refine((value) => !value || /^DEMO-\d{4}-\d{4}$/.test(value), "References look like DEMO-0410-0015");

/** Contact Support form. */
export const contactSupportSchema = z.object({
  topic: z.enum(["account", "payments", "top_ups", "data", "other"], { error: "Choose a topic" }),
  subject: z.string().trim().min(5, "Add a short subject (at least 5 characters)").max(100, "Keep the subject under 100 characters"),
  message: z.string().trim().min(20, "Tell us a little more (at least 20 characters)").max(1000, "Keep your message under 1,000 characters"),
  transactionReference,
});
export type ContactSupportValues = z.infer<typeof contactSupportSchema>;

/** Report a Problem form. Attachments are not supported without a backend. */
export const problemReportSchema = z.object({
  category: z.enum(["payment", "top_up", "exchange", "data_esim", "account", "app_issue", "other"], { error: "Choose what the problem is about" }),
  description: z.string().trim().min(20, "Describe what happened (at least 20 characters)").max(1000, "Keep it under 1,000 characters"),
  transactionReference,
  happenedBefore: z.boolean(),
});
export type ProblemReportValues = z.infer<typeof problemReportSchema>;
