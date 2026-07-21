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
import { serviceLabels } from "@/lib/demo-data"

const STATUS_TABS = [
  { value: "pending", label: "À examiner" },
  { value: "validated", label: "Validés" },
  { value: "active", label: "En placement" },
  { value: "suspended", label: "Suspendus" },
  { value: "rejected", label: "Refusés" },
  { value: "all", label: "Tous" },
]

const STATUS_LABEL: Record<string, string> = {
  pending: "À examiner",
  validated: "Validé",
  active: "En placement",
  rejected: "Refusé",
  inactive: "Inactif",
  suspended: "Suspendu",
}

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const statusFilter = status && STATUS_TABS.some((t) => t.value === status) ? status : "pending"

  const supabase = await createClient()
  let query = supabase
    .from("agents")
    .select("id, first_name, last_name, service_type, experience_years, status, trust_tier, availability, created_at")
    .order("created_at", { ascending: false })

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter)
  }

  const { data: agents, error } = await query

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">Prestataires</h1>
      <p className="mt-2 text-white/60">
        Candidatures, profils validés et gestion des statuts.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            size="sm"
            variant={statusFilter === tab.value ? "default" : "outline"}
            render={<Link href={`/admin/agents?status=${tab.value}`}>{tab.label}</Link>}
          />
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">Erreur : {error.message}</p>}

      <div className="mt-6 overflow-x-auto rounded-md border border-white/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Disponibilité</TableHead>
              <TableHead>Reçu le</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Aucun agent dans cette catégorie.
                </TableCell>
              </TableRow>
            )}
            {agents?.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium">
                  {agent.first_name} {agent.last_name}
                </TableCell>
                <TableCell>{serviceLabels[agent.service_type as keyof typeof serviceLabels]}</TableCell>
                <TableCell>
                  <Badge variant={agent.status === "pending" ? "default" : "secondary"}>
                    {STATUS_LABEL[agent.status] ?? agent.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{agent.trust_tier ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {agent.availability ? "Disponible" : "Indisponible"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(agent.created_at).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" render={<Link href={`/admin/agents/${agent.id}`}>Voir</Link>} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
