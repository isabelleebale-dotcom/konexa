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
import { quartierName, serviceLabels } from "@/lib/demo-data"

const STATUS_TABS = [
  { value: "submitted", label: "Non traitées" },
  { value: "proposed", label: "Proposition envoyée" },
  { value: "fulfilled", label: "Confirmées" },
  { value: "all", label: "Toutes" },
]

const STATUS_LABEL: Record<string, string> = {
  submitted: "Non traitée",
  proposed: "Proposition envoyée",
  accepted: "Acceptée",
  payment_pending: "Paiement en attente",
  fulfilled: "Confirmée",
  cancelled: "Annulée",
}

export default async function AdminDemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const statusFilter = status && STATUS_TABS.some((t) => t.value === status) ? status : "submitted"

  const supabase = await createClient()
  let query = supabase
    .from("requests")
    .select("id, requester_type, requester_id, service_type, quartier_id, number_of_agents, status, created_at, profiles(first_name, last_name)")
    .order("created_at", { ascending: true })

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter)
  }

  const { data: requests, error } = await query

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">Réservations</h1>
      <p className="mt-2 text-white/60">
        Demandes de placement des familles et entreprises — proposez un agent adapté.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            size="sm"
            variant={statusFilter === tab.value ? "default" : "outline"}
            render={<Link href={`/admin/demandes?status=${tab.value}`}>{tab.label}</Link>}
          />
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">Erreur : {error.message}</p>}

      <div className="mt-6 overflow-x-auto rounded-md border border-white/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Quartier</TableHead>
              <TableHead>Agents requis</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Reçue le</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Aucune demande dans cette catégorie.
                </TableCell>
              </TableRow>
            )}
            {requests?.map((request) => {
              const profile = Array.isArray(request.profiles) ? request.profiles[0] : request.profiles
              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {request.requester_type === "famille" ? "Famille" : "Entreprise"}
                    </Badge>
                  </TableCell>
                  <TableCell>{serviceLabels[request.service_type as keyof typeof serviceLabels]}</TableCell>
                  <TableCell>{quartierName(request.quartier_id)}</TableCell>
                  <TableCell>{request.number_of_agents}</TableCell>
                  <TableCell>
                    <Badge variant={request.status === "submitted" ? "default" : "outline"}>
                      {STATUS_LABEL[request.status] ?? request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" render={<Link href={`/admin/demandes/${request.id}`}>Traiter</Link>} />
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
