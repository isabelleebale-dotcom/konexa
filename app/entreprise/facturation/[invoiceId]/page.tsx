import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = await params
  const invoice = demoEntrepriseInvoices.find((i) => i.id === invoiceId)
  if (!invoice) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Facture — {MONTHS[invoice.period_month - 1]} {invoice.period_year}
        </h1>
        <Badge variant={invoice.status === "paid" ? "secondary" : "default"}>
          {STATUS_LABEL[invoice.status]}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Facture n° {invoice.id.toUpperCase()} · Émise le 1er {MONTHS[invoice.period_month - 1]} {invoice.period_year}
      </p>

      <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.line_items.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">
                  {item.amount.toLocaleString("fr-FR")} FCFA
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-medium">Total</TableCell>
              <TableCell className="text-right font-medium">
                {invoice.total_amount.toLocaleString("fr-FR")} FCFA
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <Button className="mt-5" variant="outline" disabled>
        Télécharger en PDF
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        Génération PDF réelle branchée en Phase 6 (@react-pdf/renderer).
      </p>
    </div>
  )
}
