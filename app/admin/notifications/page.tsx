import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

const TEMPLATE_LABEL: Record<string, string> = {
  placement_proposal: "Proposition de placement",
  payment_confirmed: "Paiement confirmé",
  payment_reminder: "Rappel de paiement",
  replacement_confirmed: "Remplacement confirmé",
  review_request_j7: "Demande d'avis (J+7)",
  replacement_guarantee_expiring: "Garantie bientôt expirée",
}

export default async function AdminNotificationsPage() {
  const supabase = await createClient()
  const { data: notifications, error } = await supabase
    .from("notifications_log")
    .select("id, channel, template_key, status, created_at, profiles(first_name, last_name, phone)")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">Notifications</h1>
      <p className="mt-2 text-white/60">
        Journal des SMS/WhatsApp envoyés aux utilisateurs (100 derniers).
      </p>

      {error && <p className="mt-4 text-sm text-destructive">Erreur : {error.message}</p>}

      <div className="mt-6 overflow-x-auto rounded-md border border-white/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Modèle</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucune notification envoyée.
                </TableCell>
              </TableRow>
            )}
            {notifications?.map((n) => {
              const profile = Array.isArray(n.profiles) ? n.profiles[0] : n.profiles
              return (
                <TableRow key={n.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    {profile?.first_name} {profile?.last_name} · {profile?.phone}
                  </TableCell>
                  <TableCell className="uppercase text-muted-foreground">{n.channel}</TableCell>
                  <TableCell>{TEMPLATE_LABEL[n.template_key] ?? n.template_key}</TableCell>
                  <TableCell>
                    <Badge variant={n.status === "sent" ? "secondary" : n.status === "failed" ? "destructive" : "outline"}>
                      {n.status}
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
