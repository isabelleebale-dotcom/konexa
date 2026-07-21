import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  demoFamillePlacements,
  demoFamilleRequests,
  quartierName,
  serviceLabels,
} from "@/lib/demo-data"

const REQUEST_STATUS_LABEL: Record<string, string> = {
  submitted: "En attente de proposition",
  proposed: "Proposition reçue",
  accepted: "Acceptée",
  payment_pending: "Paiement en attente",
  fulfilled: "Placement confirmé",
  cancelled: "Annulée",
}

export default function FamilleDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Tableau de bord
      </h1>
      <p className="mt-2 text-foreground/75">
        Vos placements en cours et vos demandes en attente.
      </p>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Placements actifs</h2>
        <Button size="sm" render={<Link href="/famille/demandes/nouvelle">Nouvelle demande</Link>} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {demoFamillePlacements.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun placement actif pour le moment.</p>
        )}
        {demoFamillePlacements.map((placement) => (
          <Link key={placement.id} href={`/famille/placements/${placement.id}`}>
            <Card className="transition-colors hover:border-primary/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-lg">
                    {placement.agent_first_name}
                  </CardTitle>
                  <Badge variant="secondary">
                    {placement.status === "active" ? "Actif" : placement.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-foreground/75">
                <p>
                  {serviceLabels[placement.service_type]} · {quartierName(placement.quartier_id)}
                </p>
                <p className="mt-1">
                  Débuté le {new Date(placement.start_date).toLocaleDateString("fr-FR")}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-heading text-xl font-semibold">Demandes en cours</h2>
      <div className="mt-4 space-y-3">
        {demoFamilleRequests.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune demande en cours.</p>
        )}
        {demoFamilleRequests.map((request) => (
          <Card key={request.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">
                  {serviceLabels[request.service_type]} · {quartierName(request.quartier_id)}
                </p>
                <p className="text-sm text-muted-foreground">{request.frequency}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={request.status === "proposed" ? "default" : "secondary"}>
                  {REQUEST_STATUS_LABEL[request.status]}
                </Badge>
                {request.status === "proposed" && (
                  <Button
                    size="sm"
                    render={
                      <Link href={`/famille/demandes/${request.id}/proposition`}>
                        Voir la proposition
                      </Link>
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
