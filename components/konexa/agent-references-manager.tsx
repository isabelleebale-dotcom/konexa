"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

type Reference = {
  id: string
  full_name: string
  relationship: string
  phone: string
  verified: boolean
}

const RELATIONSHIPS = ["Ancien employeur", "Proche", "Autre"]

export function AgentReferencesManager({
  agentId,
  references,
}: {
  agentId: string
  references: Reference[]
}) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [fullName, setFullName] = useState("")
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0])
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addReference() {
    if (!fullName || !phone) {
      setError("Nom et téléphone requis.")
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.from("agent_references").insert({
      agent_id: agentId,
      full_name: fullName,
      relationship,
      phone,
    })

    setLoading(false)
    if (error) {
      setError("Impossible d'ajouter cette référence.")
      return
    }

    setFullName("")
    setPhone("")
    setRelationship(RELATIONSHIPS[0])
    setAdding(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {references.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucune référence enregistrée.</p>
      )}
      {references.map((ref) => (
        <div key={ref.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
          <div>
            <p className="font-medium">{ref.full_name}</p>
            <p className="text-muted-foreground">
              {ref.relationship} · {ref.phone}
            </p>
          </div>
          {ref.verified && <span className="text-xs text-verified">Vérifiée</span>}
        </div>
      ))}

      {adding ? (
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Nom complet</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Relation</Label>
              <Select value={relationship} onValueChange={(v) => v && setRelationship(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={addReference} disabled={loading}>
              {loading ? "Ajout…" : "Ajouter"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          + Ajouter une référence
        </Button>
      )}
    </div>
  )
}
