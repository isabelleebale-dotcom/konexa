import type { PaymentProvider } from "@/lib/payments/provider"
import { mockProvider } from "@/lib/payments/providers/mock"
import { monerooProvider } from "@/lib/payments/providers/moneroo"

export function getPaymentProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === "moneroo"
    ? monerooProvider
    : mockProvider
}
