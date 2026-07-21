"use client"

import { use, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  demoAgents,
  demoFamilleRequests,
  quartierName,
  serviceLabels,
  travelFeeFor,
} from "@/lib/demo-data"

const PLACEMENT_FEE_BY_SERVICE: Record<string, number> = {
  menagere: 30_000,
  agent_entretien: 30_000,
  nounou: 50_000,
}

export default function PaiementDemandePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const request = demoFamilleRequests.find((r) => r.id === id)
  const [method, setMethod] = useState<"mtn_momo" | "orange_money">("mtn_momo")
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle")

  if (!request) notFound()
  const agent = demoAgents.find((a) => a.id === request.proposed_agent_id)
  const baseFee = PLACEMENT_FEE_BY_SERVICE[request.service_type] ?? 30_000
  const travelFee = travelFeeFor(request.quartier_id)
  const total = baseFee + travelFee

  function pay() {
    setStatus("processing")
    // Mode démo : simule le résultat webhook (voir lib/payments/handle-payment-result.ts,
    // qui exécute la même transition d'état une fois un vrai `payments` row disponible).
    setTimeout(() => setStatus("done"), 1200)
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="font-heading text-xl font-semibold">Paiement confirmé</p>
          <p className="mt-2 text-sm text-foreground/75">
            Le placement de {agent?.first_name} est confirmé. Un reçu digital
            vous sera envoyé par SMS.
          </p>
          <Button className="mt-5" onClick={() => router.push("/famille/tableau-de-bord")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Paiement</h1>
      <p className="mt-2 text-foreground/75">
        Frais de placement pour {agent?.first_name ?? "l'agent proposé"}.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service</span>
            <span>{serviceLabels[request.service_type]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quartier</span>
            <span>{quartierName(request.quartier_id)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Frais de placement</span>
            <span>{baseFee.toLocaleString("fr-FR")} FCFA</span>
          </div>
          {travelFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supplément déplacement</span>
              <span>{travelFee.toLocaleString("fr-FR")} FCFA</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium">
            <span>Total</span>
            <span>{total.toLocaleString("fr-FR")} FCFA</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Moyen de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("mtn_momo")}
              className={`rounded-md border p-3 text-sm font-medium ${
                method === "mtn_momo" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              MTN MoMo
            </button>
            <button
              type="button"
              onClick={() => setMethod("orange_money")}
              className={`rounded-md border p-3 text-sm font-medium ${
                method === "orange_money" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              Orange Money
            </button>
          </div>
          <Button className="w-full" onClick={pay} disabled={status === "processing"}>
            {status === "processing"
              ? "Traitement…"
              : `Payer ${total.toLocaleString("fr-FR")} FCFA`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
