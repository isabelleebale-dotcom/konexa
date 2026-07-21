import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TIER_DESCRIPTIONS, TrustBadge } from "@/components/konexa/verified-badge"
import { AvailabilityToggle } from "@/components/konexa/availability-toggle"
import { AgentProfileEditor } from "@/components/konexa/agent-profile-editor"
import { AgentReferencesManager } from "@/components/konexa/agent-references-manager"
import { createClient } from "@/lib/supabase/server"
import { quartierName, serviceLabels } from "@/lib/demo-data"
import type { TrustTier } from "@/lib/supabase/types"

const STATUS_COPY: Record<string, { label: string; note: string }> = {
  pending: {
    label: "En cours de vérification",
    note: "Votre dossier est en cours d'examen par l'équipe KONEXA. Vous serez averti(e) par SMS dès qu'il sera validé.",
  },
  validated: {
    label: "Validé",
    note: "Votre profil est visible dans le catalogue. Vous recevrez une notification à chaque proposition de placement.",
  },
  active: {
    label: "En placement",
    note: "Vous êtes actuellement en mission.",
  },
  rejected: {
    label: "Candidature refusée",
    note: "Contactez KONEXA pour plus d'informations sur votre dossier.",
  },
  inactive: { label: "Inactif", note: "" },
  suspended: { label: "Suspendu", note: "Contactez KONEXA." },
}

export default async function AgentEspacePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", user?.id)
    .single()

  if (!agent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 text-center sm:px-6">
        <p className="font-heading text-xl font-semibold">Aucune candidature trouvée</p>
        <p className="mt-2 text-sm text-foreground/75">
          Vous n&rsquo;avez pas encore soumis de candidature agent.{" "}
          <Link href="/devenir-agent" className="text-primary">
            Postulez ici
          </Link>
          .
        </p>
      </div>
    )
  }

  const { data: placements } = await supabase
    .from("placements")
    .select("id, service_type, quartier_id, start_date, status, client_type")
    .eq("agent_id", agent.id)
    .in("status", ["active", "replacement_in_progress"])

  const { data: earnings } = await supabase
    .from("agent_earnings_estimate")
    .select("estimated_total_earnings")
    .eq("agent_id", agent.id)
    .maybeSingle()

  const { data: references } = await supabase
    .from("agent_references")
    .select("id, full_name, relationship, phone, verified")
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false })

  const statusCopy = STATUS_COPY[agent.status] ?? { label: agent.status, note: "" }
  const currentPlacement = placements?.[0]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Bonjour {agent.first_name}
        </h1>
        <AvailabilityToggle agentId={agent.id} initialAvailability={agent.availability} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">Statut de votre profil</CardTitle>
            <Badge variant={agent.status === "pending" ? "outline" : "secondary"}>
              {statusCopy.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/75">{statusCopy.note}</p>
          {agent.trust_tier && (
            <div className="mt-3">
              <TrustBadge tier={agent.trust_tier} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {TIER_DESCRIPTIONS[agent.trust_tier as TrustTier]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Placement actuel</CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlacement ? (
            <div className="text-sm text-foreground/80">
              <p>
                {serviceLabels[currentPlacement.service_type as keyof typeof serviceLabels]} ·{" "}
                {quartierName(currentPlacement.quartier_id)}
              </p>
              <p className="mt-1 text-muted-foreground">
                Client masqué par initiales tant que le placement est en cours — visible une fois confirmé.
              </p>
              <p className="mt-1 text-muted-foreground">
                Depuis le {new Date(currentPlacement.start_date).toLocaleDateString("fr-FR")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun placement en cours actuellement.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Gains cumulés (estimation)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-2xl font-semibold">
            {(earnings?.estimated_total_earnings ?? 0).toLocaleString("fr-FR")} FCFA
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimation indicative — le salaire est versé directement par le client, KONEXA ne facture
            que la commission de suivi.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Modifier mon profil</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complétez votre description : services rendus, compétences,
            disponibilités — plus votre profil est détaillé, plus vous
            recevrez de propositions.
          </p>
        </CardHeader>
        <CardContent>
          <AgentProfileEditor agentId={agent.id} initialBio={agent.bio ?? ""} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Mes références</CardTitle>
          <p className="text-sm text-muted-foreground">
            Anciens employeurs ou proches que KONEXA peut contacter pour
            renforcer votre badge de confiance.
          </p>
        </CardHeader>
        <CardContent>
          <AgentReferencesManager agentId={agent.id} references={references ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
