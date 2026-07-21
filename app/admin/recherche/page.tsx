import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function AdminRecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? "").trim()

  if (!query) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-white/60">Tapez une recherche dans la barre en haut.</p>
      </div>
    )
  }

  const supabase = await createClient()

  const [{ data: clients }, { data: agents }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, phone, role")
      .in("role", ["famille", "entreprise"])
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(20),
    supabase
      .from("agents")
      .select("id, first_name, last_name, phone, status")
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(20),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-white">
        Résultats pour &laquo;&nbsp;{query}&nbsp;&raquo;
      </h1>

      <h2 className="mt-8 font-heading text-lg font-semibold text-white">
        Clients ({clients?.length ?? 0})
      </h2>
      <div className="mt-3 space-y-2">
        {!clients?.length && <p className="text-sm text-muted-foreground">Aucun résultat.</p>}
        {clients?.map((c) => (
          <Link key={c.id} href={`/admin/clients/${c.id}`}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex items-center justify-between py-3">
                <span>{c.first_name} {c.last_name} · {c.phone}</span>
                <Badge variant="secondary">{c.role === "famille" ? "Famille" : "Entreprise"}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 font-heading text-lg font-semibold text-white">
        Prestataires ({agents?.length ?? 0})
      </h2>
      <div className="mt-3 space-y-2">
        {!agents?.length && <p className="text-sm text-muted-foreground">Aucun résultat.</p>}
        {agents?.map((a) => (
          <Link key={a.id} href={`/admin/agents/${a.id}`}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex items-center justify-between py-3">
                <span>{a.first_name} {a.last_name} · {a.phone}</span>
                <Badge variant="outline">{a.status}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
