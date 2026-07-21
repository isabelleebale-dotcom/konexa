import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  demoEntrepriseInvoices,
  demoEntreprisePlacements,
  demoEntrepriseRequests,
  quartierName,
  serviceLabels,
} from "@/lib/demo-data"

export default function EntrepriseDashboardPage() {
  const latestInvoice = demoEntrepriseInvoices[demoEntrepriseInvoices.length - 1]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Tableau de bord</h1>
      <p className="mt-2 text-foreground/75">
        Vos agents affectés, demandes en cours et facturation.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agents affectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-semibold">{demoEntreprisePlacements.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Demandes en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-semibold">{demoEntrepriseRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facture en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-semibold">
              {latestInvoice.total_amount.toLocaleString("fr-FR")} FCFA
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Agents affectés</h2>
        <Button size="sm" render={<Link href="/entreprise/demandes/nouvelle">Nouvelle demande</Link>} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {demoEntreprisePlacements.map((placement) => (
          <Link key={placement.id} href={`/entreprise/agents/${placement.id}`}>
            <Card className="transition-colors hover:border-primary/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-lg">
                    {placement.agent_first_name}
                  </CardTitle>
                  <Badge variant="secondary">Actif</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-foreground/75">
                <p>
                  {serviceLabels[placement.service_type]} · {quartierName(placement.quartier_id)}
                </p>
                <p className="mt-1">
                  Depuis le {new Date(placement.start_date).toLocaleDateString("fr-FR")}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-heading text-xl font-semibold">Demandes en cours</h2>
      <div className="mt-4 space-y-3">
        {demoEntrepriseRequests.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune demande en cours.</p>
        )}
        {demoEntrepriseRequests.map((request) => (
          <Card key={request.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">
                  {serviceLabels[request.service_type]} · {quartierName(request.quartier_id)}
                </p>
                <p className="text-sm text-muted-foreground">{request.frequency}</p>
              </div>
              <Badge variant="secondary">En attente de proposition</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
