"use client"

import { useMemo, useState } from "react"
import { AgentCard } from "@/components/konexa/agent-card"
import { demoQuartiers, serviceLabels } from "@/lib/demo-data"
import { villes, quartierNamesForVille } from "@/lib/locations"
import { cn } from "@/lib/utils"
import type { AgentPublic } from "@/lib/supabase/types"

const ACTIVE_REGIONS = ["Littoral", "Centre", "Ouest"]

const SERVICE_ORDER: AgentPublic["service_type"][] = ["menagere", "nounou", "agent_entretien"]

export function RegionAgentsExplorer({ agents }: { agents: AgentPublic[] }) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const selectedVille = selectedRegion ? villes.find((v) => v.region === selectedRegion) : null

  const filteredAgents = useMemo(() => {
    if (!selectedVille) return []
    const quartierNames = quartierNamesForVille(selectedVille.id)
    const quartierIds = demoQuartiers
      .filter((q) => quartierNames.includes(q.name))
      .map((q) => q.id)
    return agents.filter((agent) => agent.quartier_ids.some((id) => quartierIds.includes(id)))
  }, [agents, selectedVille])

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-foreground/70">Régions du Cameroun</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {villes.map((ville) => {
          const active = ACTIVE_REGIONS.includes(ville.region)
          const isSelected = selectedRegion === ville.region
          return (
            <button
              key={ville.id}
              type="button"
              disabled={!active}
              onClick={() => setSelectedRegion(isSelected ? null : ville.region)}
              className={cn(
                "rounded-sm border px-3 py-1.5 text-left text-sm transition-colors",
                active
                  ? isSelected
                    ? "border-verified bg-verified/15 text-verified"
                    : "border-verified/40 bg-verified/10 text-verified hover:bg-verified/15"
                  : "cursor-not-allowed border-white/10 bg-white/5 text-muted-foreground"
              )}
            >
              <span>{ville.region}</span>
              <span className="ml-1.5 text-xs opacity-70">
                {active ? `— ${ville.name}` : "Bientôt"}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        KONEXA vérifie ses agents en personne, région par région — actif au
        Littoral, au Centre et à l&rsquo;Ouest, en cours d&rsquo;extension
        ailleurs au Cameroun.
      </p>

      {selectedVille && (
        <div className="mt-6">
          <p className="text-sm font-medium text-foreground/80">
            Agents à {selectedVille.name} ({filteredAgents.length})
          </p>
          {filteredAgents.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Pas encore d&rsquo;agent disponible dans cette zone — revenez bientôt.
            </p>
          ) : (
            <div className="mt-4 space-y-8">
              {SERVICE_ORDER.map((service) => {
                const group = filteredAgents.filter((a) => a.service_type === service)
                if (group.length === 0) return null
                return (
                  <div key={service}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                      {serviceLabels[service]} ({group.length})
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
