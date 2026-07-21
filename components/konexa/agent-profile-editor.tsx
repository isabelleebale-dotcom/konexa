"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

export function AgentProfileEditor({
  agentId,
  initialBio,
}: {
  agentId: string
  initialBio: string
}) {
  const router = useRouter()
  const [bio, setBio] = useState(initialBio)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setLoading(true)
    setSaved(false)
    const supabase = createClient()
    const { error } = await supabase.from("agents").update({ bio }).eq("id", agentId)
    setLoading(false)
    if (!error) {
      setSaved(true)
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={5}
        placeholder="Décrivez vos compétences, les services que vous proposez, vos disponibilités..."
      />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {saved && <span className="text-sm text-verified">Profil mis à jour ✓</span>}
      </div>
    </div>
  )
}
