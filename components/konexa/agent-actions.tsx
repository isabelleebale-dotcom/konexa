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
import type { TrustTier } from "@/lib/supabase/types"

type AgentStatus = "pending" | "validated" | "rejected" | "active" | "inactive" | "suspended"

export function AgentActions({
  agentId,
  status,
  currentTier,
}: {
  agentId: string
  status: AgentStatus
  currentTier: TrustTier | null
}) {
  const router = useRouter()
  const [tier, setTier] = useState<TrustTier>(currentTier ?? "verified")
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function updateStatus(newStatus: AgentStatus, extra?: Record<string, unknown>) {
    setLoading(newStatus)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase
      .from("agents")
      .update({ status: newStatus, ...extra })
      .eq("id", agentId)

    setLoading(null)
    if (error) {
      setError(error.message)
      return
    }
    router.push("/admin/agents")
    router.refresh()
  }

  async function updateTier() {
    setLoading("tier")
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.from("agents").update({ trust_tier: tier }).eq("id", agentId)
    setLoading(null)
    if (error) {
      setError(error.message)
      return
    }
    router.refresh()
  }

  async function validate() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    await updateStatus("validated", {
      trust_tier: tier,
      validated_by: user?.id,
      validated_at: new Date().toISOString(),
    })
  }

  return (
    <div className="space-y-3 rounded-md border border-white/10 bg-card p-4">
      <p className="font-medium">Décision</p>
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">Badge de confiance</p>
        <Select value={tier} onValueChange={(v) => v && setTier(v as TrustTier)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="verified">Vérifié</SelectItem>
            <SelectItem value="verified_plus">Vérifié+</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {status === "pending" && (
        <div className="flex gap-2">
          <Button className="flex-1" onClick={validate} disabled={loading !== null}>
            {loading === "validated" ? "Validation…" : "Valider"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => updateStatus("rejected")}
            disabled={loading !== null}
          >
            {loading === "rejected" ? "Refus…" : "Refuser"}
          </Button>
        </div>
      )}

      {(status === "validated" || status === "active") && (
        <div className="space-y-2">
          <Button className="w-full" variant="outline" onClick={updateTier} disabled={loading !== null}>
            {loading === "tier" ? "Mise à jour…" : "Mettre à jour le badge"}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => updateStatus("suspended")}
            disabled={loading !== null}
          >
            {loading === "suspended" ? "Suspension…" : "Suspendre ce profil"}
          </Button>
        </div>
      )}

      {status === "suspended" && (
        <Button className="w-full" onClick={() => updateStatus("validated")} disabled={loading !== null}>
          {loading === "validated" ? "Réactivation…" : "Réactiver ce profil"}
        </Button>
      )}

      {status === "rejected" && (
        <Button className="w-full" onClick={validate} disabled={loading !== null}>
          {loading === "validated" ? "Validation…" : "Valider malgré tout"}
        </Button>
      )}
    </div>
  )
}
