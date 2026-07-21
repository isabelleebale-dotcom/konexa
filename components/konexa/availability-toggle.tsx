"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function AvailabilityToggle({
  agentId,
  initialAvailability,
}: {
  agentId: string
  initialAvailability: boolean
}) {
  const router = useRouter()
  const [available, setAvailable] = useState(initialAvailability)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("agents")
      .update({ availability: !available })
      .eq("id", agentId)

    setLoading(false)
    if (!error) {
      setAvailable((v) => !v)
      router.refresh()
    }
  }

  return (
    <Button variant={available ? "default" : "outline"} size="sm" onClick={toggle} disabled={loading}>
      {available ? "Disponible" : "Indisponible"} — changer
    </Button>
  )
}
