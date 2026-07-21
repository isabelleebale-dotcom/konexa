import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TIER_DESCRIPTIONS, TrustBadge } from "@/components/konexa/verified-badge"
import { ReserveAgentButton } from "@/components/konexa/reserve-agent-button"
import { quartierNames, serviceLabels, travelFeeFor } from "@/lib/demo-data"
import { getAgentReviews, getPublicAgent } from "@/lib/queries/agents"

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agent = await getPublicAgent(id)
  if (!agent) notFound()

  const reviews = await getAgentReviews(agent.id)
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null
  const zones = quartierNames(agent.quartier_ids)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-20 rounded-sm">
            <AvatarImage src={agent.photo_url ?? undefined} alt={agent.first_name} />
            <AvatarFallback className="rounded-sm text-xl">
              {agent.first_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {agent.first_name}
            </h1>
            <p className="mt-1 text-foreground/75">
              {serviceLabels[agent.service_type]} · {agent.experience_years} ans
              d&rsquo;expérience
            </p>
            <div className="mt-3 flex items-center gap-3">
              {agent.trust_tier && <TrustBadge tier={agent.trust_tier} />}
              {avgRating && (
                <span className="text-sm text-muted-foreground">
                  ★ {avgRating} ({reviews.length} avis)
                </span>
              )}
            </div>
            {agent.trust_tier && (
              <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                {TIER_DESCRIPTIONS[agent.trust_tier]}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {agent.availability ? (
            <ReserveAgentButton agent={agent} />
          ) : (
            <Button size="lg" disabled>
              Actuellement placée
            </Button>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <h2 className="font-heading text-xl font-semibold">À propos</h2>
          <p className="mt-3 text-foreground/85">{agent.bio}</p>

          <h2 className="mt-8 font-heading text-xl font-semibold">
            Zones d&rsquo;intervention
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {zones.length === 0 && (
              <span className="text-sm text-muted-foreground">
                Zones non précisées — contactez KONEXA pour vérifier la couverture.
              </span>
            )}
            {agent.quartier_ids.map((qId, i) => {
              const fee = travelFeeFor(qId)
              return (
                <span
                  key={qId}
                  className="rounded-sm border border-border bg-secondary/40 px-2.5 py-1 text-xs text-foreground/80"
                >
                  {zones[i]}
                  {fee > 0 && (
                    <span className="text-muted-foreground"> (+{fee.toLocaleString("fr-FR")} FCFA)</span>
                  )}
                </span>
              )
            })}
          </div>

          <h2 className="mt-10 font-heading text-xl font-semibold">
            Avis clients ({reviews.length})
          </h2>
          <div className="mt-4 space-y-4">
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Pas encore d&rsquo;avis pour cet agent.
              </p>
            )}
            {reviews.map((review) => (
              <div key={review.id} className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{review.client_first_name}</p>
                  <span className="text-sm text-muted-foreground">
                    ★ {review.rating}/5
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-foreground/80">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-md border border-border bg-secondary/30 p-5 text-sm">
          <p className="font-medium">Comment fonctionne la réservation ?</p>
          <ol className="mt-3 list-decimal space-y-2 pl-4 text-foreground/75">
            <li>Créez un compte (famille ou entreprise)</li>
            <li>Confirmez la réservation de cet agent</li>
            <li>Payez les frais de placement en mobile money</li>
            <li>Le placement démarre — suivi et garantie inclus</li>
          </ol>
        </aside>
      </div>
    </div>
  )
}
