import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { demoFamillePayments, demoFamillePlacements } from "@/lib/demo-data"

const TYPE_LABEL: Record<string, string> = {
  placement_fee: "Frais de placement",
  monthly_commission: "Commission mensuelle",
  express_replacement_fee: "Remplacement express",
}

export default function FamillePaiementsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Paiements</h1>
      <p className="mt-2 text-foreground/75">
        Historique de vos paiements KONEXA, avec reçus digitaux.
      </p>

      <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoFamillePayments.map((payment) => {
              const placement = demoFamillePlacements.find((p) => p.id === payment.placement_id)
              return (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.paid_at
                      ? new Date(payment.paid_at).toLocaleDateString("fr-FR")
                      : "—"}
                  </TableCell>
                  <TableCell>{TYPE_LABEL[payment.type]}</TableCell>
                  <TableCell>{placement?.agent_first_name ?? "—"}</TableCell>
                  <TableCell>{payment.amount.toLocaleString("fr-FR")} FCFA</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === "confirmed" ? "secondary" : "outline"}>
                      {payment.status === "confirmed" ? "Confirmé" : payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" disabled={payment.status !== "confirmed"}>
                      Reçu PDF
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Génération de reçus PDF réels branchée en Phase 6 (@react-pdf/renderer).
      </p>
    </div>
  )
}
