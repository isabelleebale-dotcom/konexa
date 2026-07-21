import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function AgentAvisPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("user_id", user?.id)
    .single()

  const { data: reviews } = agent
    ? await supabase
        .from("agent_reviews_public")
        .select("*")
        .eq("agent_id", agent.id)
        .order("published_at", { ascending: false })
    : { data: [] }

  const avgRating = reviews?.length
    ? (reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Mes avis</h1>
      <p className="mt-2 text-foreground/75">
        {avgRating
          ? `Note moyenne : ★ ${avgRating} (${reviews?.length} avis)`
          : "Pas encore d'avis publiés."}
      </p>

      <div className="mt-6 space-y-3">
        {reviews?.map((review: { id: string; client_first_name: string; rating: number; comment: string | null; published_at: string | null }) => (
          <Card key={review.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{review.client_first_name}</p>
                <span className="text-sm text-muted-foreground">★ {review.rating}/5</span>
              </div>
              <p className="mt-1.5 text-sm text-foreground/80">{review.comment}</p>
              {review.published_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(review.published_at).toLocaleDateString("fr-FR")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
