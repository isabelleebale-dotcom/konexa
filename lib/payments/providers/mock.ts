import type {
  InitializePaymentInput,
  InitializePaymentResult,
  PaymentProvider,
} from "@/lib/payments/provider"

/**
 * Development-only provider. Returns a checkout URL pointing at an internal
 * simulation page instead of talking to Moneroo. Disabled in production via
 * the PAYMENT_PROVIDER env toggle in get-provider.ts.
 */
export const mockProvider: PaymentProvider = {
  async initialize(
    input: InitializePaymentInput
  ): Promise<InitializePaymentResult> {
    return {
      checkoutUrl: `/paiement/simulation/${input.paymentId}`,
      providerRef: `mock_${input.paymentId}`,
    }
  },

  async parseWebhook() {
    // The mock provider never receives real webhooks — outcomes are applied
    // directly by api/payments/simulate/[paymentId], which calls the same
    // handlePaymentResult() function the real webhook handler uses.
    return null
  },
}
