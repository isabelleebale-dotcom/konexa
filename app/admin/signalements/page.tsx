import { Card, CardContent } from "@/components/ui/card"
import { IssueStatusSelect } from "@/components/konexa/issue-status-select"
import { createClient } from "@/lib/supabase/server"

export default async function AdminSignalementsPage() {
  const supabase = await createClient()

  const { data: issues, error } = await supabase
    .from("issue_reports")
    .select("id, category, description, status, created_at, profiles(first_name, last_name), placements(agents(first_name, last_name))")
    .order("created_at", { ascending: false })

  const { data: replacements } = await supabase
    .from("replacement_requests")
    .select("id, reason, type, status, sla_deadline, created_at, placements(agents(first_name, last_name))")
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">Signalements</h1>
      <p className="mt-2 text-white/60">Problèmes signalés et demandes de remplacement.</p>

      {error && <p className="mt-4 text-sm text-destructive">Erreur : {error.message}</p>}

      <h2 className="mt-8 font-heading text-lg font-semibold text-white">
        Problèmes signalés ({issues?.length ?? 0})
      </h2>
      <div className="mt-4 space-y-3">
        {issues?.length === 0 && <p className="text-sm text-muted-foreground">Aucun signalement.</p>}
        {issues?.map((issue) => {
          const client = Array.isArray(issue.profiles) ? issue.profiles[0] : issue.profiles
          const placement = Array.isArray(issue.placements) ? issue.placements[0] : issue.placements
          const agent = placement?.agents
            ? Array.isArray(placement.agents)
              ? placement.agents[0]
              : placement.agents
            : null
          return (
            <Card key={issue.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">
                    {issue.category} — {client?.first_name} {client?.last_name} → {agent?.first_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(issue.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <IssueStatusSelect issueId={issue.id} status={issue.status} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <h2 className="mt-10 font-heading text-lg font-semibold text-white">
        Demandes de remplacement ({replacements?.length ?? 0})
      </h2>
      <div className="mt-4 space-y-3">
        {replacements?.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune demande de remplacement.</p>
        )}
        {replacements?.map((r) => {
          const placement = Array.isArray(r.placements) ? r.placements[0] : r.placements
          const agent = placement?.agents
            ? Array.isArray(placement.agents)
              ? placement.agents[0]
              : placement.agents
            : null
          return (
            <Card key={r.id}>
              <CardContent className="py-4">
                <p className="font-medium">
                  {agent?.first_name} {agent?.last_name} — {r.type === "free_guarantee" ? "Garantie gratuite" : "Express payant"}
                </p>
                <p className="text-sm text-muted-foreground">{r.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">Statut : {r.status}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
