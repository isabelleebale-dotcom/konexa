import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart, BreakdownPieChart } from "@/components/konexa/admin-charts"
import { createClient } from "@/lib/supabase/server"
import { serviceLabels } from "@/lib/demo-data"

type Kpis = {
  pending_requests: number
  active_placements: number
  pending_applications: number
  revenue_this_month: number
  open_issues: number
}

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_kpis")
  const kpis = (data as Kpis | null) ?? {
    pending_requests: 0,
    active_placements: 0,
    pending_applications: 0,
    revenue_this_month: 0,
    open_issues: 0,
  }

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, paid_at")
    .eq("status", "confirmed")
    .gte("paid_at", sixMonthsAgo.toISOString())

  const revenueByMonth = new Map<string, number>()
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo)
    d.setMonth(d.getMonth() + i)
    revenueByMonth.set(`${d.getFullYear()}-${d.getMonth()}`, 0)
  }
  for (const p of payments ?? []) {
    if (!p.paid_at) continue
    const d = new Date(p.paid_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + p.amount)
    }
  }
  const revenueData = Array.from(revenueByMonth.entries()).map(([key, total]) => {
    const [, month] = key.split("-")
    return { month: MONTHS_FR[Number(month)], total }
  })

  const { data: placements } = await supabase.from("placements").select("service_type")
  const serviceCounts = new Map<string, number>()
  for (const p of placements ?? []) {
    serviceCounts.set(p.service_type, (serviceCounts.get(p.service_type) ?? 0) + 1)
  }
  const serviceData = Array.from(serviceCounts.entries()).map(([service, value]) => ({
    name: serviceLabels[service as keyof typeof serviceLabels] ?? service,
    value,
  }))

  const { data: agentsByStatus } = await supabase.from("agents").select("status")
  const statusCounts = new Map<string, number>()
  for (const a of agentsByStatus ?? []) {
    statusCounts.set(a.status, (statusCounts.get(a.status) ?? 0) + 1)
  }
  const STATUS_LABEL: Record<string, string> = {
    pending: "À examiner",
    validated: "Validés",
    active: "En placement",
    rejected: "Refusés",
    inactive: "Inactifs",
    suspended: "Suspendus",
  }
  const agentStatusData = Array.from(statusCounts.entries()).map(([status, value]) => ({
    name: STATUS_LABEL[status] ?? status,
    value,
  }))

  const tiles = [
    { label: "Demandes en attente", value: kpis.pending_requests },
    { label: "Placements actifs", value: kpis.active_placements },
    { label: "Candidatures à examiner", value: kpis.pending_applications },
    { label: "Revenus ce mois", value: `${kpis.revenue_this_month.toLocaleString("fr-FR")} FCFA` },
    { label: "Signalements ouverts", value: kpis.open_issues },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">Tableau de bord</h1>
      <p className="mt-2 text-white/60">Vue d&rsquo;ensemble de l&rsquo;activité KONEXA.</p>

      {error && (
        <p className="mt-4 text-sm text-destructive">
          Impossible de charger les KPIs : {error.message}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {tile.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-semibold text-white">{tile.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Revenus confirmés (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Placements par service</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Pas encore de placements.</p>
            ) : (
              <BreakdownPieChart data={serviceData} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Répartition des prestataires par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {agentStatusData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucun agent enregistré.</p>
            ) : (
              <BreakdownPieChart data={agentStatusData} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
