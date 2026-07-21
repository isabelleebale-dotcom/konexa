import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPaymentProvider } from "@/lib/payments/get-provider"

const PLACEMENT_FEE_BY_SERVICE: Record<string, number> = {
  menagere: 30_000,
  agent_entretien: 30_000,
  nounou: 50_000,
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { placementId, type, payerPhone } = (await request.json()) as {
    placementId: string
    type: "placement_fee" | "monthly_commission" | "express_replacement_fee"
    payerPhone: string
  }

  const { data: placement } = await supabase
    .from("placements")
    .select("id, client_id, service_type, salary_monthly, commission_rate, quartier_id")
    .eq("id", placementId)
    .single()

  if (!placement || placement.client_id !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  let amountXaf: number
  if (type === "placement_fee") {
    amountXaf = PLACEMENT_FEE_BY_SERVICE[placement.service_type] ?? 30_000

    if (placement.quartier_id) {
      const { data: quartier } = await supabase
        .from("quartiers")
        .select("travel_fee")
        .eq("id", placement.quartier_id)
        .single()
      amountXaf += quartier?.travel_fee ?? 0
    }
  } else if (type === "monthly_commission") {
    amountXaf = Math.round(
      placement.salary_monthly * placement.commission_rate
    )
  } else {
    amountXaf = 15_000
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      placement_id: placementId,
      type,
      amount: amountXaf,
      status: "pending",
    })
    .select("id")
    .single()

  if (error || !payment) {
    return NextResponse.json({ error: "could not create payment" }, { status: 500 })
  }

  const provider = getPaymentProvider()
  const { checkoutUrl, providerRef } = await provider.initialize({
    paymentId: payment.id,
    amountXaf,
    payerPhone,
    description: `KONEXA — ${type}`,
    returnUrl: `${request.nextUrl.origin}/paiement/retour?paymentId=${payment.id}`,
  })

  await supabase
    .from("payments")
    .update({ moneroo_transaction_id: providerRef })
    .eq("id", payment.id)

  return NextResponse.json({ checkoutUrl })
}
