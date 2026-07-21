import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { quartierName, serviceLabels } from "@/lib/demo-data"

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from("profiles")
    .select("*, famille_profiles(*), entreprise_profiles(*)")
    .eq("id", clientId)
    .single()

  if (!client) notFound()

  const entrepriseInfo = Array.isArray(client.entreprise_profiles)
    ? client.entreprise_profiles[0]
    : client.entreprise_profiles
  const familleInfo = Array.isArray(client.famille_profiles)
    ? client.famille_profiles[0]
    : client.famille_profiles

  const { data: requests } = await supabase
    .from("requests")
    .select("id, service_type, quartier_id, status, created_at")
    .eq("requester_id", clientId)
    .order("created_at", { ascending: false })

  const { data: placements } = await supabase
    .from("placements")
    .select("id, agent_id, service_type, status, start_date, agents(first_name)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  const { data: payments } = await supabase
    .from("payments")
    .select("id, type, amount, status, paid_at, placement_id")
    .in("placement_id", (placements ?? []).map((p) => p.id))
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">
        {client.first_name} {client.last_name}
      </h1>
      <p className="mt-1 text-white/60">
        {client.role === "entreprise" ? entrepriseInfo?.company_name : "Famille"} · {client.phone}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-foreground/80">
            <p>Téléphone : {client.phone}</p>
            <p>Ville : {familleInfo?.city ?? "Douala"}</p>
            {entrepriseInfo?.sector && <p>Secteur : {entrepriseInfo.sector}</p>}
            <p>Inscrit le {new Date(client.created_at).toLocaleDateString("fr-FR")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Placements ({placements?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!placements?.length && <p className="text-sm text-muted-foreground">Aucun placement.</p>}
            {placements?.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>
                  {(p.agents as { first_name?: string } | null)?.first_name ?? "—"} ·{" "}
                  {serviceLabels[p.service_type as keyof typeof serviceLabels]}
                </span>
                <Badge variant="secondary">{p.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Demandes ({requests?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!requests?.length && <p className="text-sm text-muted-foreground">Aucune demande.</p>}
          {requests?.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-sm">
              <span>
                {serviceLabels[r.service_type as keyof typeof serviceLabels]} ·{" "}
                {quartierName(r.quartier_id)}
              </span>
              <Badge variant="outline">{r.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Paiements ({payments?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!payments?.length && <p className="text-sm text-muted-foreground">Aucun paiement.</p>}
          {payments?.map((pay) => (
            <div key={pay.id} className="flex items-center justify-between text-sm">
              <span>{pay.type} — {pay.amount.toLocaleString("fr-FR")} FCFA</span>
              <Badge variant={pay.status === "confirmed" ? "secondary" : "outline"}>{pay.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
