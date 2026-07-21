"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LocationPicker } from "@/components/konexa/location-picker"
import { createClient } from "@/lib/supabase/client"
import { serviceLabels } from "@/lib/demo-data"
import type { AgentPublic } from "@/lib/supabase/types"

const DASHBOARD_PATH: Record<string, string> = {
  famille: "/famille/tableau-de-bord",
  entreprise: "/entreprise/tableau-de-bord",
}

export function SignupForm({ next }: { next?: string }) {
  const router = useRouter()

  const [role, setRole] = useState<"famille" | "entreprise">("famille")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [quartierId, setQuartierId] = useState("")
  const [quartierFreeText, setQuartierFreeText] = useState("")
  const [serviceType, setServiceType] = useState<AgentPublic["service_type"]>("menagere")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch("/api/auth/instant-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role,
        first_name: firstName,
        last_name: lastName,
        phone,
        ...(role === "entreprise" ? { company_name: companyName } : {}),
      }),
    })
    const result = await res.json()

    if (!res.ok) {
      setLoading(false)
      setError(result.error ?? "Impossible de créer le compte.")
      return
    }

    const supabase = createClient()
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    })
    if (sessionError) {
      setLoading(false)
      setError("Compte créé mais connexion impossible. Réessayez de vous connecter.")
      return
    }

    const userId = result.user_id as string
    const quartierIdNum = quartierId ? Number(quartierId) : null

    if (role === "entreprise") {
      await supabase.from("entreprise_profiles").insert({
        user_id: userId,
        company_name: companyName,
        quartier_id: quartierIdNum,
        quartier_free_text: quartierFreeText || null,
      })
    } else {
      await supabase.from("famille_profiles").insert({
        user_id: userId,
        quartier_id: quartierIdNum,
        quartier_free_text: quartierFreeText || null,
      })
    }

    // Démarre directement une première demande avec le service choisi à
    // l'inscription — le créneau (request_slots) est créé automatiquement
    // par un trigger DB.
    await supabase.from("requests").insert({
      requester_type: role,
      requester_id: userId,
      service_type: serviceType,
      quartier_id: quartierIdNum,
      number_of_agents: 1,
      notes: quartierFreeText ? `Quartier précisé : ${quartierFreeText}` : null,
    })

    setLoading(false)
    router.push(next || DASHBOARD_PATH[role])
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Tabs value={role} onValueChange={(v) => setRole(v as typeof role)}>
        <TabsList className="w-full">
          <TabsTrigger value="famille" className="flex-1">
            Famille
          </TabsTrigger>
          <TabsTrigger value="entreprise" className="flex-1">
            Entreprise
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">Prénom</Label>
          <Input
            id="first_name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Nom</Label>
          <Input
            id="last_name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      {role === "entreprise" && (
        <div className="space-y-1.5">
          <Label htmlFor="company_name">Nom de l&rsquo;entreprise</Label>
          <Input
            id="company_name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Numéro de téléphone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+237 6XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Localisation</Label>
        <LocationPicker
          mode="single"
          value={quartierId}
          onChange={setQuartierId}
          freeText={quartierFreeText}
          onFreeTextChange={setQuartierFreeText}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Service demandé</Label>
        <Select
          value={serviceType}
          onValueChange={(v) => v && setServiceType(v as AgentPublic["service_type"])}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(serviceLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Création du compte…" : "S'inscrire"}
      </Button>
    </form>
  )
}
