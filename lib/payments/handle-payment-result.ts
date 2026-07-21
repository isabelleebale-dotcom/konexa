import { createServiceClient } from "@/lib/supabase/service"
import type { PaymentOutcome } from "@/lib/payments/provider"
import { notifyUser } from "@/lib/notifications/service"

/**
 * Single source of truth for what happens when a payment resolves —
 * called by both the real Moneroo webhook handler and the mock
 * simulation route, so the two paths can never drift apart.
 */
export async function handlePaymentResult(
  paymentId: string,
  outcome: PaymentOutcome
) {
  const supabase = createServiceClient()

  const { data: payment } = await supabase
    .from("payments")
    .select("id, status, type, placement_id")
    .eq("id", paymentId)
    .single()

  if (!payment) {
    throw new Error(`Unknown payment: ${paymentId}`)
  }

  // idempotent: ignore repeat webhook deliveries once already resolved
  if (payment.status === "confirmed" || payment.status === "failed") {
    return
  }

  if (outcome === "failure") {
    await supabase
      .from("payments")
      .update({ status: "failed" })
      .eq("id", paymentId)
    return
  }

  await supabase
    .from("payments")
    .update({ status: "confirmed", paid_at: new Date().toISOString() })
    .eq("id", paymentId)

  const { data: placement } = await supabase
    .from("placements")
    .select("id, status, client_id, agent_id")
    .eq("id", payment.placement_id)
    .single()

  if (!placement) return

  if (payment.type === "placement_fee") {
    await supabase
      .from("placements")
      .update({ status: "active" })
      .eq("id", placement.id)

    await notifyUser(placement.client_id, "payment_confirmed", {
      placement_id: placement.id,
    })
  }

  if (payment.type === "express_replacement_fee") {
    await supabase
      .from("replacement_requests")
      .update({ status: "agent_reassigned" })
      .eq("express_fee_payment_id", paymentId)
  }

  // Receipt PDF generation is wired in Phase 6 (lib/documents/receipt.ts),
  // once @react-pdf/renderer templates and the `receipts` storage bucket
  // policies are in place.
}
