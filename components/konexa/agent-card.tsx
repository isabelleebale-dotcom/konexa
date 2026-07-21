import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrustBadge } from "@/components/konexa/verified-badge"
import { demoReviews, quartierNames, serviceLabels } from "@/lib/demo-data"
import type { AgentPublic } from "@/lib/supabase/types"

export function AgentCard({ agent }: { agent: AgentPublic }) {
  const reviews = demoReviews.filter((r) => r.agent_id === agent.id)
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const zones = quartierNames(agent.quartier_ids)
  const zonesLabel =
    zones.length > 2
      ? `${zones.slice(0, 2).join(", ")} +${zones.length - 2}`
      : zones.join(", ")

  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group flex flex-col gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 rounded-sm">
            <AvatarImage src={agent.photo_url ?? undefined} alt={agent.first_name} />
            <AvatarFallback className="rounded-sm">
              {agent.first_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading text-base font-semibold leading-tight">
              {agent.first_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {serviceLabels[agent.service_type]} · {zonesLabel || "Douala"}
            </p>
          </div>
        </div>
        {!agent.availability && (
          <span className="shrink-0 rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Placée
          </span>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-foreground/80">{agent.bio}</p>

      <div className="mt-auto flex items-center justify-between pt-1">
        {agent.trust_tier && <TrustBadge tier={agent.trust_tier} />}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {avgRating && (
            <span className="flex items-center gap-1">
              <span aria-hidden="true">★</span> {avgRating} ({reviews.length})
            </span>
          )}
          <span>{agent.experience_years} ans d&rsquo;exp.</span>
        </div>
      </div>
    </Link>
  )
}
