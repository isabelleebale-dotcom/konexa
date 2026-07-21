"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

const OPTIONS = [
  { value: "open", label: "Ouvert" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolu" },
]

export function IssueStatusSelect({ issueId, status }: { issueId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function update(value: string) {
    setLoading(true)
    const supabase = createClient()
    await supabase.from("issue_reports").update({ status: value }).eq("id", issueId)
    setLoading(false)
    router.refresh()
  }

  return (
    <Select value={status} onValueChange={(v) => v && update(v)} disabled={loading}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
