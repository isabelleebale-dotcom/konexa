"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentSimulationPage({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  const { paymentId } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState<"success" | "failure" | null>(null)

  async function simulate(outcome: "success" | "failure") {
    setLoading(outcome)
    await fetch(`/api/payments/simulate/${paymentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    })
    router.push(`/paiement/retour?paymentId=${paymentId}`)
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Simulation de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mode démo — aucun vrai paiement MTN MoMo / Orange Money n&rsquo;est
            envoyé. Choisis une issue pour continuer le parcours.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => simulate("success")}
              disabled={loading !== null}
            >
              {loading === "success" ? "Traitement…" : "Simuler succès"}
            </Button>
            <Button
              variant="outline"
              onClick={() => simulate("failure")}
              disabled={loading !== null}
            >
              {loading === "failure" ? "Traitement…" : "Simuler échec"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
