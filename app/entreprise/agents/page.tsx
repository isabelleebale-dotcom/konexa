import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VerifiedBadge } from "@/components/konexa/verified-badge"
import { demoEntreprisePlacements, quartierName, serviceLabels } from "@/lib/demo-data"

export default function EntrepriseAgentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Agents affectés</h1>
      <p className="mt-2 text-foreground/75">
        Gérez la présence, signalez un problème ou demandez un remplacement d&rsquo;urgence.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {demoEntreprisePlacements.map((placement) => {
          const lastPresence = placement.presence[placement.presence.length - 1]
          return (
            <Link key={placement.id} href={`/entreprise/agents/${placement.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-lg">
                      {placement.agent_first_name}
                    </CardTitle>
                    <VerifiedBadge />
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-foreground/75">
                  <p>
                    {serviceLabels[placement.service_type]} · {quartierName(placement.quartier_id)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-muted-foreground">Dernier pointage :</span>
                    <Badge
                      variant={
                        lastPresence.status === "present"
                          ? "secondary"
                          : lastPresence.status === "late"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {lastPresence.status === "present"
                        ? "Présent"
                        : lastPresence.status === "late"
                          ? "En retard"
                          : "Absent"}{" "}
                      · {new Date(lastPresence.date).toLocaleDateString("fr-FR")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
