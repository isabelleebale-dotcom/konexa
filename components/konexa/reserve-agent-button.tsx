"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { AgentPublic } from "@/lib/supabase/types"

export function ReserveAgentButton({ agent }: { agent: AgentPublic }) {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleReserve() {
    setStatus("loading")
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/inscription?next=/agents/${agent.id}`)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = (profile as { role?: string } | null)?.role
    if (role !== "famille" && role !== "entreprise") {
      setStatus("idle")
      setError("Seuls les comptes famille ou entreprise peuvent réserver un agent.")
      return
    }

    const { error: requestError } = await supabase.from("requests").insert({
      requester_type: role,
      requester_id: user.id,
      service_type: agent.service_type,
      quartier_id: agent.quartier_ids[0] ?? null,
      number_of_agents: 1,
      notes: `Agent spécifiquement demandé : ${agent.first_name} (id ${agent.id}).`,
    })

    if (requestError) {
      setStatus("idle")
      setError("Impossible d'envoyer la réservation. Réessayez.")
      return
    }

    setStatus("done")
    setTimeout(() => {
      router.push(role === "famille" ? "/famille/tableau-de-bord" : "/entreprise/tableau-de-bord")
    }, 1800)
  }

  if (status === "done") {
    return (
      <div className="text-right">
        <p className="text-sm font-medium text-verified">Demande envoyée ✓</p>
        <p className="text-xs text-muted-foreground">
          Éric Bruno confirme la réservation de {agent.first_name} sous 48h.
        </p>
      </div>
    )
  }

  return (
    <div className="text-right">
      <Button size="lg" onClick={handleReserve} disabled={status === "loading"}>
        {status === "loading" ? "Envoi…" : "Réserver cet agent"}
      </Button>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}
