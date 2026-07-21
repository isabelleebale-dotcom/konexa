"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

type Candidate = { id: string; first_name: string; last_name: string; trust_tier: string | null }

export function SlotMatcher({
  slotId,
  requestId,
  candidates,
}: {
  slotId: string
  requestId: string
  candidates: Candidate[]
}) {
  const router = useRouter()
  const [agentId, setAgentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function propose() {
    if (!agentId) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error: proposalError } = await supabase.from("proposals").insert({
      request_slot_id: slotId,
      agent_id: agentId,
      proposed_by: user?.id,
      status: "pending",
    })

    if (proposalError) {
      setLoading(false)
      setError(proposalError.message)
      return
    }

    await supabase.from("request_slots").update({ status: "proposed" }).eq("id", slotId)
    await supabase.from("requests").update({ status: "proposed" }).eq("id", requestId)

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={agentId} onValueChange={(v) => v && setAgentId(v)}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Choisir un agent" />
        </SelectTrigger>
        <SelectContent>
          {candidates.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">Aucun agent disponible</div>
          )}
          {candidates.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.first_name} {c.last_name} {c.trust_tier ? `· ${c.trust_tier}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" onClick={propose} disabled={!agentId || loading}>
        {loading ? "Envoi…" : "Proposer"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  )
}
