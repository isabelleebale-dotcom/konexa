"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

export function QuartierRowEditor({
  id,
  name,
  isActive,
  travelFee,
}: {
  id: number
  name: string
  isActive: boolean
  travelFee: number
}) {
  const router = useRouter()
  const [fee, setFee] = useState(String(travelFee))
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from("quartiers")
      .update({ travel_fee: Number(fee) || 0, is_active: active })
      .eq("id", id)
    setLoading(false)
    router.refresh()
  }

  async function toggleActive(value: boolean) {
    setActive(value)
    const supabase = createClient()
    await supabase.from("quartiers").update({ is_active: value }).eq("id", id)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-white/5 py-3 last:border-b-0">
      <span className="w-40 font-medium">{name}</span>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Switch checked={active} onCheckedChange={toggleActive} />
        {active ? "Actif" : "Inactif"}
      </label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          className="w-28"
        />
        <span className="text-sm text-muted-foreground">FCFA supplément</span>
      </div>
      <Button size="sm" variant="outline" onClick={save} disabled={loading}>
        {loading ? "…" : "Enregistrer"}
      </Button>
    </div>
  )
}
