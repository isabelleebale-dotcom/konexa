import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { handlePaymentResult } from "@/lib/payments/handle-payment-result"

/**
 * Mock-mode only: simulates a Moneroo webhook outcome for local/demo use.
 * Uses the caller's own session (not the service-role client) to look up
 * the payment — RLS (payments_client_select, scoped to the owning
 * placement) is what actually authorizes this, so a payment that isn't
 * the caller's own is invisible and the route 404s instead of letting
 * anyone confirm/fail an arbitrary payment.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  if (process.env.PAYMENT_PROVIDER === "moneroo") {
    return NextResponse.json(
      { error: "simulation disabled — PAYMENT_PROVIDER=moneroo" },
      { status: 403 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { paymentId } = await params

  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("id", paymentId)
    .single()

  if (!payment) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const { outcome } = (await request.json()) as {
    outcome: "success" | "failure"
  }

  await handlePaymentResult(paymentId, outcome)

  return NextResponse.json({ ok: true })
}
