import { createHmac, timingSafeEqual } from "crypto"
import type {
  InitializePaymentInput,
  InitializePaymentResult,
  PaymentProvider,
} from "@/lib/payments/provider"

const MONEROO_BASE_URL =
  process.env.MONEROO_BASE_URL ?? "https://api.moneroo.io/v1"

/**
 * Real Moneroo integration (MTN MoMo + Orange Money aggregator). Requires
 * MONEROO_SECRET_KEY and MONEROO_WEBHOOK_SECRET to be set — see .env.local.example.
 * Not testable end-to-end until the account/credentials exist and the app is
 * deployed behind a public HTTPS URL Moneroo can reach for webhooks (Phase 6).
 */
export const monerooProvider: PaymentProvider = {
  async initialize(
    input: InitializePaymentInput
  ): Promise<InitializePaymentResult> {
    const secretKey = process.env.MONEROO_SECRET_KEY
    if (!secretKey) {
      throw new Error(
        "MONEROO_SECRET_KEY is not set — cannot initialize a real payment"
      )
    }

    const res = await fetch(`${MONEROO_BASE_URL}/payments/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountXaf,
        currency: "XAF",
        customer: { phone: input.payerPhone },
        description: input.description,
        return_url: input.returnUrl,
        metadata: { payment_id: input.paymentId },
      }),
    })

    if (!res.ok) {
      throw new Error(`Moneroo initialize failed: ${res.status}`)
    }

    const data = (await res.json()) as {
      data: { checkout_url: string; id: string }
    }

    return {
      checkoutUrl: data.data.checkout_url,
      providerRef: data.data.id,
    }
  },

  async parseWebhook(rawBody, signature) {
    const webhookSecret = process.env.MONEROO_WEBHOOK_SECRET
    if (!webhookSecret || !signature) return null

    const expected = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex")

    const sigBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expected)
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null
    }

    const event = JSON.parse(rawBody) as {
      event: string
      data: { id: string; status: string }
    }

    const outcome =
      event.data.status === "success" || event.event === "payment.success"
        ? ("success" as const)
        : ("failure" as const)

    return { providerRef: event.data.id, outcome }
  },
}
