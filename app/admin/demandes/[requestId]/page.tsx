import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SlotMatcher } from "@/components/konexa/slot-matcher"
import { createClient } from "@/lib/supabase/server"
import { quartierName, serviceLabels } from "@/lib/demo-data"

const SLOT_STATUS_LABEL: Record<string, string> = {
  open: "Ouvert",
  proposed: "Proposition envoyée",
  accepted: "Acceptée par le client",
  filled: "Placement confirmé",
  cancelled: "Annulé",
}

export default async function AdminDemandeDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>
}) {
  const { requestId } = await params
  const supabase = await createClient()

  const { data: request } = await supabase
    .from("requests")
    .select("*, profiles(first_name, last_name, phone)")
    .eq("id", requestId)
    .single()

  if (!request) notFound()

  const requester = Array.isArray(request.profiles) ? request.profiles[0] : request.profiles

  const { data: slots } = await supabase
    .from("request_slots")
    .select("*, proposals(id, status, agent_id, agents(first_name, last_name))")
    .eq("request_id", requestId)
    .order("slot_index")

  const { data: candidates } = await supabase
    .from("agents")
    .select("id, first_name, last_name, trust_tier")
    .eq("service_type", request.service_type)
    .in("status", ["validated", "active"])
    .eq("availability", true)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">
        Demande — {requester?.first_name} {requester?.last_name}
      </h1>
      <p className="mt-1 text-white/60">
        {serviceLabels[request.service_type as keyof typeof serviceLabels]} ·{" "}
        {quartierName(request.quartier_id)} · {request.number_of_agents} agent(s) requis
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Détails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-foreground/80">
          <p>Client : {requester?.first_name} {requester?.last_name} ({requester?.phone})</p>
          <p>Date de début souhaitée : {request.desired_start_date ? new Date(request.desired_start_date).toLocaleDateString("fr-FR") : "—"}</p>
          {request.sector_constraints && <p>Contraintes : {request.sector_constraints}</p>}
          {request.notes && <p>Notes : {request.notes}</p>}
        </CardContent>
      </Card>

      <h2 className="mt-8 font-heading text-xl font-semibold text-white">
        Créneaux ({slots?.length ?? 0})
      </h2>
      <div className="mt-4 space-y-4">
        {!slots?.length && (
          <p className="text-sm text-muted-foreground">
            Aucun créneau généré pour cette demande.
          </p>
        )}
        {slots?.map((slot) => {
          const proposal = Array.isArray(slot.proposals) ? slot.proposals[0] : slot.proposals
          const proposedAgent = proposal?.agents
            ? Array.isArray(proposal.agents)
              ? proposal.agents[0]
              : proposal.agents
            : null

          return (
            <Card key={slot.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">Créneau #{slot.slot_index + 1}</p>
                  <Badge variant={slot.status === "open" ? "outline" : "secondary"} className="mt-1">
                    {SLOT_STATUS_LABEL[slot.status] ?? slot.status}
                  </Badge>
                  {proposedAgent && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Proposé : {proposedAgent.first_name} {proposedAgent.last_name}
                    </p>
                  )}
                </div>
                {slot.status === "open" && (
                  <SlotMatcher slotId={slot.id} requestId={requestId} candidates={candidates ?? []} />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
