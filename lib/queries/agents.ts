import { createClient } from "@/lib/supabase/server"
import type { AgentPublic, AgentReviewPublic } from "@/lib/supabase/types"

export async function getPublicAgents(): Promise<AgentPublic[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("agents_public")
    .select("*")
    .order("id")

  if (error) {
    console.error("getPublicAgents:", error.message)
    return []
  }
  return (data ?? []) as AgentPublic[]
}

export async function getPublicAgent(id: string): Promise<AgentPublic | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("agents_public")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as AgentPublic
}

export async function getAgentReviews(agentId: string): Promise<AgentReviewPublic[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("agent_reviews_public")
    .select("*")
    .eq("agent_id", agentId)
    .order("published_at", { ascending: false })

  if (error) {
    console.error("getAgentReviews:", error.message)
    return []
  }
  return (data ?? []) as AgentReviewPublic[]
}
