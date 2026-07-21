export type PaymentMethod = "mtn_momo" | "orange_money"

export interface InitializePaymentInput {
  paymentId: string
  amountXaf: number
  payerPhone: string
  description: string
  returnUrl: string
}

export interface InitializePaymentResult {
  checkoutUrl: string
  providerRef: string
}

export type PaymentOutcome = "success" | "failure"

export interface PaymentProvider {
  initialize(input: InitializePaymentInput): Promise<InitializePaymentResult>
  /** Verifies an inbound webhook signature; returns the parsed event or null if invalid. */
  parseWebhook(
    rawBody: string,
    signature: string | null
  ): Promise<{ providerRef: string; outcome: PaymentOutcome } | null>
}
