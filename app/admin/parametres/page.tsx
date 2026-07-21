import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuartierRowEditor } from "@/components/konexa/quartier-row-editor"
import { createClient } from "@/lib/supabase/server"

export default async function AdminParametresPage() {
  const supabase = await createClient()
  const { data: quartiers, error } = await supabase
    .from("quartiers")
    .select("id, name, is_active, travel_fee")
    .order("name")

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">Paramètres</h1>
      <p className="mt-2 text-white/60">
        Zones de couverture et suppléments de déplacement.
      </p>

      {error && <p className="mt-4 text-sm text-destructive">Erreur : {error.message}</p>}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Quartiers ({quartiers?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {quartiers?.map((q) => (
            <QuartierRowEditor
              key={q.id}
              id={q.id}
              name={q.name}
              isActive={q.is_active}
              travelFee={q.travel_fee}
            />
          ))}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Désactiver un quartier le retire des formulaires de demande et de
        candidature, sans supprimer les agents déjà associés. Les frais de
        placement (30 000 / 50 000 FCFA) restent définis dans le code pour
        l&rsquo;instant — à externaliser ici si la tarification doit changer
        souvent.
      </p>
    </div>
  )
}
