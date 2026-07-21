"use client"

import { useMemo, useState } from "react"
import { AgentCard } from "@/components/konexa/agent-card"
import { demoQuartiers, serviceLabels } from "@/lib/demo-data"
import { villes, arrondissementsForVille, DOUALA_ARRONDISSEMENT_QUARTIERS } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AgentPublic } from "@/lib/supabase/types"

const SERVICE_FILTERS: { value: AgentPublic["service_type"] | "all"; label: string }[] = [
  { value: "all", label: "Tous les services" },
  { value: "menagere", label: serviceLabels.menagere },
  { value: "nounou", label: serviceLabels.nounou },
  { value: "agent_entretien", label: serviceLabels.agent_entretien },
]

const selectClass = cn("h-9 rounded-md border border-input bg-background px-3 text-sm")

export function AgentsCatalogClient({
  agents,
  initialService = "all",
}: {
  agents: AgentPublic[]
  initialService?: AgentPublic["service_type"] | "all"
}) {
  const [service, setService] = useState<AgentPublic["service_type"] | "all">(initialService)
  const [villeId, setVilleId] = useState("all")
  const [arrondissementId, setArrondissementId] = useState("all")
  const [quartierId, setQuartierId] = useState<number | "all">("all")
  const [availableOnly, setAvailableOnly] = useState(false)

  const arrondissementOptions = villeId !== "all" ? arrondissementsForVille(villeId) : []
  const quartierNames =
    arrondissementId !== "all" ? DOUALA_ARRONDISSEMENT_QUARTIERS[arrondissementId] ?? [] : []
  const quartierOptions =
    quartierNames.length > 0
      ? demoQuartiers.filter((q) => quartierNames.includes(q.name))
      : demoQuartiers

  const filtered = useMemo(() => {
    return agents.filter((agent) => {
      if (service !== "all" && agent.service_type !== service) return false
      if (quartierId !== "all") {
        if (!agent.quartier_ids.includes(quartierId)) return false
      } else if (arrondissementId !== "all" && quartierNames.length > 0) {
        const agentQuartierNamesInArr = demoQuartiers
          .filter((q) => agent.quartier_ids.includes(q.id))
          .some((q) => quartierNames.includes(q.name))
        if (!agentQuartierNamesInArr) return false
      }
      if (availableOnly && !agent.availability) return false
      return true
    })
  }, [agents, service, quartierId, arrondissementId, quartierNames, availableOnly])

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {SERVICE_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={service === f.value ? "default" : "outline"}
            onClick={() => setService(f.value)}
          >
            {f.label}
          </Button>
        ))}

        <span className="mx-1 h-5 w-px bg-border" />

        <select
          className={selectClass}
          value={villeId}
          onChange={(e) => {
            setVilleId(e.target.value)
            setArrondissementId("all")
            setQuartierId("all")
          }}
        >
          <option value="all">Toutes les villes</option>
          {villes.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={arrondissementId}
          onChange={(e) => {
            setArrondissementId(e.target.value)
            setQuartierId("all")
          }}
          disabled={villeId === "all"}
        >
          <option value="all">Tous les arrondissements</option>
          {arrondissementOptions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={quartierId}
          onChange={(e) =>
            setQuartierId(e.target.value === "all" ? "all" : Number(e.target.value))
          }
        >
          <option value="all">Tous les quartiers</option>
          {quartierOptions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.name}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant={availableOnly ? "default" : "outline"}
          onClick={() => setAvailableOnly((v) => !v)}
        >
          Disponible maintenant
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-14 rounded-md border border-dashed border-border p-10 text-center">
          <p className="font-heading text-lg font-semibold">
            Aucun agent ne correspond à ces critères
          </p>
          <p className="mt-2 text-sm text-foreground/75">
            Soumettez une demande personnalisée et Éric Bruno vous proposera
            un agent adapté sous 48h.
          </p>
          <Button className="mt-5" render={<a href="/inscription">Soumettre une demande</a>} />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </>
  )
}
