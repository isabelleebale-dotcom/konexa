"use client"

import { use, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrustBadge } from "@/components/konexa/verified-badge"
import {
  demoAgents,
  demoFamilleRequests,
  quartierName,
  serviceLabels,
} from "@/lib/demo-data"

export default function PropositionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const request = demoFamilleRequests.find((r) => r.id === id)
  const [declined, setDeclined] = useState(false)

  if (!request) notFound()
  const agent = demoAgents.find((a) => a.id === request.proposed_agent_id)

  if (!agent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6 text-center text-sm text-muted-foreground">
        Aucune proposition disponible pour cette demande pour le moment.
      </div>
    )
  }

  if (declined) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="font-heading text-xl font-semibold">Proposition refusée</p>
          <p className="mt-2 text-sm text-foreground/75">
            Éric Bruno a été notifié et vous proposera un autre agent sous
            48h.
          </p>
          <Button className="mt-5" onClick={() => router.push("/famille/tableau-de-bord")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Proposition d&rsquo;agent
      </h1>
      <p className="mt-2 text-foreground/75">
        Pour votre demande : {serviceLabels[request.service_type]} ·{" "}
        {quartierName(request.quartier_id)}
      </p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-sm">
              <AvatarFallback className="rounded-sm text-lg">
                {agent.first_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-heading text-xl font-semibold">{agent.first_name}</p>
              <p className="text-sm text-muted-foreground">
                {serviceLabels[agent.service_type]} · {agent.experience_years} ans d&rsquo;expérience
              </p>
              {agent.trust_tier && <TrustBadge tier={agent.trust_tier} className="mt-2" />}
            </div>
          </div>
          <p className="mt-4 text-sm text-foreground/80">{agent.bio}</p>

          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1"
              render={<a href={`/famille/demandes/${id}/paiement`}>Accepter et payer</a>}
            />
            <Button variant="outline" className="flex-1" onClick={() => setDeclined(true)}>
              Refuser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
