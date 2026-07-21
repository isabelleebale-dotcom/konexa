export interface NotificationProvider {
  send(
    to: string,
    templateKey: string,
    variables: Record<string, string>
  ): Promise<{ providerMessageId: string }>
}

export type TemplateKey =
  | "placement_proposal"
  | "payment_confirmed"
  | "payment_reminder"
  | "replacement_confirmed"
  | "review_request_j7"
  | "replacement_guarantee_expiring"
