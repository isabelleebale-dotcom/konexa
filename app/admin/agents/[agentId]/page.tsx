import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentActions } from "@/components/konexa/agent-actions"
import { createClient } from "@/lib/supabase/server"
import { quartierName, serviceLabels } from "@/lib/demo-data"

const DOC_LABELS: Record<string, string> = {
  id_card: "Carte nationale d'identité",
  passport: "Passeport",
  cv: "CV",
  criminal_record: "Casier judiciaire",
  selfie_with_id: "Selfie avec pièce d'identité",
  reference_letter: "Lettre de référence",
  other: "Autre document",
}

export default async function AdminAgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>
}) {
  const { agentId } = await params
  const supabase = await createClient()

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .single()

  if (!agent) notFound()

  const { data: quartiers } = await supabase
    .from("agent_quartiers")
    .select("quartier_id")
    .eq("agent_id", agentId)

  const { data: references } = await supabase
    .from("agent_references")
    .select("*")
    .eq("agent_id", agentId)

  const { data: documents } = await supabase
    .from("agent_documents")
    .select("*")
    .eq("agent_id", agentId)

  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc: { id: string; doc_type: string; storage_path: string }) => {
      const { data } = await supabase.storage
        .from("agent-documents")
        .createSignedUrl(doc.storage_path, 600)
      return { ...doc, url: data?.signedUrl }
    })
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">
          {agent.first_name} {agent.last_name}
        </h1>
        <Badge>{agent.status}</Badge>
      </div>
      <p className="mt-1 text-white/60">
        {serviceLabels[agent.service_type as keyof typeof serviceLabels]} · {agent.experience_years} ans
        d&rsquo;expérience · {agent.phone}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="space-y-6 sm:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Bio</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/80">{agent.bio || "—"}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Zones d&rsquo;intervention</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {quartiers?.length ? (
                quartiers.map((q: { quartier_id: number }) => (
                  <span
                    key={q.quartier_id}
                    className="rounded-sm border border-border bg-secondary/40 px-2.5 py-1 text-xs"
                  >
                    {quartierName(q.quartier_id)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucune zone déclarée.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Localisation approximative</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/80">
              {agent.latitude && agent.longitude
                ? `${agent.latitude}, ${agent.longitude}`
                : "Non fournie"}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Documents ({documentsWithUrls.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {documentsWithUrls.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun document soumis.</p>
              )}
              {documentsWithUrls.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:border-primary/40"
                >
                  <span>{DOC_LABELS[doc.doc_type] ?? doc.doc_type}</span>
                  <span className="text-primary">Voir →</span>
                </a>
              ))}
              {agent.criminal_record_provided && (
                <p className="text-xs text-verified">Casier judiciaire fourni</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Références ({references?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!references?.length && (
                <p className="text-sm text-muted-foreground">Aucune référence fournie.</p>
              )}
              {references?.map((ref: { id: string; full_name: string; relationship: string; phone: string }) => (
                <div key={ref.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">{ref.full_name}</p>
                  <p className="text-muted-foreground">
                    {ref.relationship} · {ref.phone}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <AgentActions agentId={agent.id} status={agent.status} currentTier={agent.trust_tier} />
        </div>
      </div>
    </div>
  )
}
