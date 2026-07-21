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

type RoleFilter = "all" | "famille" | "entreprise"

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await searchParams
  const roleFilter: RoleFilter =
    role === "famille" || role === "entreprise" ? role : "all"

  const supabase = await createClient()
  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, phone, role, created_at, famille_profiles(city, quartier_id), entreprise_profiles(company_name)")
    .in("role", roleFilter === "all" ? ["famille", "entreprise"] : [roleFilter])
    .order("created_at", { ascending: false })

  const { data: clients, error } = await query

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white">Clients</h1>
      <p className="mt-2 text-white/60">Familles et entreprises inscrites sur KONEXA.</p>

      <div className="mt-6 flex gap-2">
        <Button size="sm" variant={roleFilter === "all" ? "default" : "outline"} render={<Link href="/admin/clients">Tous</Link>} />
        <Button size="sm" variant={roleFilter === "famille" ? "default" : "outline"} render={<Link href="/admin/clients?role=famille">Familles</Link>} />
        <Button size="sm" variant={roleFilter === "entreprise" ? "default" : "outline"} render={<Link href="/admin/clients?role=entreprise">Entreprises</Link>} />
      </div>

      {error && <p className="mt-4 text-sm text-destructive">Erreur : {error.message}</p>}

      <div className="mt-6 overflow-x-auto rounded-md border border-white/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Détail</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucun client trouvé.
                </TableCell>
              </TableRow>
            )}
            {clients?.map((client) => {
              const familleInfo = Array.isArray(client.famille_profiles)
                ? client.famille_profiles[0]
                : client.famille_profiles
              const entrepriseInfo = Array.isArray(client.entreprise_profiles)
                ? client.entreprise_profiles[0]
                : client.entreprise_profiles

              return (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.first_name} {client.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {client.role === "famille" ? "Famille" : "Entreprise"}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {entrepriseInfo?.company_name ?? familleInfo?.city ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" render={<Link href={`/admin/clients/${client.id}`}>Voir</Link>} />
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
