import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ReviewHideToggle } from "@/components/konexa/review-hide-toggle"
import { createClient } from "@/lib/supabase/server"

export default async function AdminAvisPage() {
  const supabase = await createClient()
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, status, published_at, created_at, agents(first_name, last_name), profiles(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">Avis</h1>
      <p className="mt-2 text-white/60">
        Publication automatique à J+7 — vous pouvez masquer un avis après coup.
      </p>

      {error && <p className="mt-4 text-sm text-destructive">Erreur : {error.message}</p>}

      <div className="mt-6 space-y-3">
        {reviews?.length === 0 && <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>}
        {reviews?.map((review) => {
          const agent = Array.isArray(review.agents) ? review.agents[0] : review.agents
          const client = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
          return (
            <Card key={review.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {client?.first_name} → {agent?.first_name} {agent?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">★ {review.rating}/5</p>
                    <p className="mt-1.5 text-sm text-foreground/80">{review.comment}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant={review.status === "published" ? "secondary" : "outline"}>
                      {review.status === "published" ? "Publié" : review.status === "hidden" ? "Masqué" : "Programmé"}
                    </Badge>
                    {review.status !== "scheduled" && (
                      <ReviewHideToggle reviewId={review.id} hidden={review.status === "hidden"} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
