"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function ReviewHideToggle({ reviewId, hidden }: { reviewId: string; hidden: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from("reviews")
      .update({ status: hidden ? "published" : "hidden" })
      .eq("id", reviewId)
    setLoading(false)
    router.refresh()
  }

  return (
    <Button size="sm" variant="outline" onClick={toggle} disabled={loading}>
      {loading ? "…" : hidden ? "Republier" : "Masquer"}
    </Button>
  )
}
