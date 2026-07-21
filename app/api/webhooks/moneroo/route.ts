import { NextResponse, type NextRequest } from "next/server"
import { monerooProvider } from "@/lib/payments/providers/moneroo"
import { handlePaymentResult } from "@/lib/payments/handle-payment-result"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-moneroo-signature")

  const event = await monerooProvider.parseWebhook(rawBody, signature)
  if (!event) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("moneroo_transaction_id", event.providerRef)
    .single()

  if (!payment) {
    return NextResponse.json({ error: "unknown payment" }, { status: 404 })
  }

  await handlePaymentResult(payment.id, event.outcome)

  return NextResponse.json({ received: true })
}
