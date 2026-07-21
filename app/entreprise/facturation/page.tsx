import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { demoEntrepriseInvoices } from "@/lib/demo-data"

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]

const STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  issued: "À payer",
  paid: "Payée",
  overdue: "En retard",
}

export default function FacturationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Facturation</h1>
      <p className="mt-2 text-foreground/75">
        Factures mensuelles avec ventilation par agent.
      </p>

      <div className="mt-6 space-y-3">
        {demoEntrepriseInvoices.map((invoice) => (
          <Link key={invoice.id} href={`/entreprise/facturation/${invoice.id}`}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">
                    {MONTHS[invoice.period_month - 1]} {invoice.period_year}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.total_amount.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
                <Badge variant={invoice.status === "paid" ? "secondary" : "default"}>
                  {STATUS_LABEL[invoice.status]}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
