"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LocationPicker } from "@/components/konexa/location-picker"
import { serviceLabels } from "@/lib/demo-data"
import { createClient } from "@/lib/supabase/client"
import type { AgentPublic } from "@/lib/supabase/types"

const FREQUENCIES = [
  "Temps plein, lundi-vendredi",
  "3x/semaine",
  "Ponctuel",
]

export default function NouvelleDemandePage() {
  const router = useRouter()
  const [serviceType, setServiceType] = useState<AgentPublic["service_type"]>("menagere")
  const [quartierId, setQuartierId] = useState("")
  const [quartierFreeText, setQuartierFreeText] = useState("")
  const [frequency, setFrequency] = useState(FREQUENCIES[0])
  const [startDate, setStartDate] = useState("")
  const [budget, setBudget] = useState("")
  const [notes, setNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      setError("Vous devez être connecté(e).")
      return
    }

    const combinedNotes = [
      `Fréquence : ${frequency}`,
      budget && `Budget max : ${budget} FCFA/mois`,
      quartierFreeText && `Quartier précisé : ${quartierFreeText}`,
      notes,
    ]
      .filter(Boolean)
      .join(" — ")

    const { data: request, error: requestError } = await supabase
      .from("requests")
      .insert({
        requester_type: "famille",
        requester_id: user.id,
        service_type: serviceType,
        quartier_id: quartierId ? Number(quartierId) : null,
        desired_start_date: startDate || null,
        number_of_agents: 1,
        notes: combinedNotes,
      })
      .select("id")
      .single()

    if (requestError || !request) {
      setLoading(false)
      setError("Impossible d'envoyer la demande. Réessayez.")
      return
    }

    // Le créneau (request_slots) est créé automatiquement par un trigger DB.
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="font-heading text-xl font-semibold">Demande envoyée</p>
          <p className="mt-2 text-sm text-foreground/75">
            Éric Bruno va examiner votre demande et vous proposera un agent
            adapté sous 48h ouvrées. Vous serez notifié(e) par SMS.
          </p>
          <Button className="mt-5" onClick={() => router.push("/famille/tableau-de-bord")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Nouvelle demande
      </h1>
      <p className="mt-2 text-foreground/75">
        Décrivez votre besoin, Éric Bruno vous propose un agent adapté sous 48h.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Détails de la demande</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type de service</Label>
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
              <Label>Fréquence</Label>
              <Select value={frequency} onValueChange={(v) => v && setFrequency(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start_date">Date de début souhaitée</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget">Budget max (FCFA/mois)</Label>
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  placeholder="50000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Précisions (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Horaires exacts, enfants à charge, tâches spécifiques..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Envoi…" : "Envoyer ma demande"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
