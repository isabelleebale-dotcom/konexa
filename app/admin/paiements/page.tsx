import Link from "next/link"
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
import { createClient } from "@/lib/supabase/server"

const STATUS_TABS = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmés" },
  { value: "failed", label: "Échoués" },
]

const TYPE_LABEL: Record<string, string> = {
  placement_fee: "Frais de placement",
  monthly_commission: "Commission mensuelle",
  express_replacement_fee: "Remplacement express",
}

export default async function AdminPaiementsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const statusFilter = status && STATUS_TABS.some((t) => t.value === status) ? status : "all"

  const supabase = await createClient()
  let query = supabase
    .from("payments")
    .select("id, type, amount, status, paid_at, created_at, placements(client_id, agent_id, profiles(first_name, last_name), agents(first_name, last_name))")
    .order("created_at", { ascending: false })
    .limit(100)

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter)
  }

  const { data: payments, error } = await query

  const total = (payments ?? [])
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">Paiements</h1>
      <p className="mt-2 text-white/60">
        {total.toLocaleString("fr-FR")} FCFA confirmés sur les 100 derniers paiements affichés.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            size="sm"
            variant={statusFilter === tab.value ? "default" : "outline"}
            render={<Link href={`/admin/paiements?status=${tab.value}`}>{tab.label}</Link>}
          />
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">Erreur : {error.message}</p>}

      <div className="mt-6 overflow-x-auto rounded-md border border-white/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucun paiement.
                </TableCell>
              </TableRow>
            )}
            {payments?.map((payment) => {
              const placement = Array.isArray(payment.placements) ? payment.placements[0] : payment.placements
              const client = placement?.profiles
                ? Array.isArray(placement.profiles)
                  ? placement.profiles[0]
                  : placement.profiles
                : null
              const agent = placement?.agents
                ? Array.isArray(placement.agents)
                  ? placement.agents[0]
                  : placement.agents
                : null
              return (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>{TYPE_LABEL[payment.type] ?? payment.type}</TableCell>
                  <TableCell>{client ? `${client.first_name} ${client.last_name}` : "—"}</TableCell>
                  <TableCell>{agent ? `${agent.first_name} ${agent.last_name}` : "—"}</TableCell>
                  <TableCell>{payment.amount.toLocaleString("fr-FR")} FCFA</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "confirmed"
                          ? "secondary"
                          : payment.status === "failed"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
