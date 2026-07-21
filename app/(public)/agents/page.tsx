import { AgentsCatalogClient } from "@/components/konexa/agents-catalog-client"
import { getPublicAgents } from "@/lib/queries/agents"
import type { AgentPublic } from "@/lib/supabase/types"

const VALID_SERVICES = new Set(["menagere", "nounou", "agent_entretien"])

export default async function AgentsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const agents = await getPublicAgents()
  const { service } = await searchParams
  const initialService = (
    service && VALID_SERVICES.has(service) ? service : "all"
  ) as AgentPublic["service_type"] | "all"

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Catalogue d&rsquo;agents vérifiés
      </h1>
      <p className="mt-2 text-foreground/75">
        Parcourez librement les profils, sans créer de compte. La réservation
        nécessite une connexion.
      </p>

      <AgentsCatalogClient agents={agents} initialService={initialService} />
    </div>
  )
}
