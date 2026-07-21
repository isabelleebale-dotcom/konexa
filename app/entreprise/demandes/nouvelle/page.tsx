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
import { demoQuartiers, serviceLabels } from "@/lib/demo-data"
import type { AgentPublic } from "@/lib/supabase/types"

export default function NouvelleDemandeEntreprisePage() {
  const router = useRouter()
  const [serviceType, setServiceType] = useState<AgentPublic["service_type"]>("agent_entretien")
  const [quartierId, setQuartierId] = useState("")
  const [numberOfAgents, setNumberOfAgents] = useState("1")
  const [startDate, setStartDate] = useState("")
  const [sectorConstraints, setSectorConstraints] = useState("")
  const [contractDuration, setContractDuration] = useState("")
  const [specDoc, setSpecDoc] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // TODO(branchement DB): insert `requests` + N `request_slots` (un par
    // agent demandé) via lib/supabase/client.ts, upload specDoc vers le
    // bucket `business-specs`.
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="font-heading text-xl font-semibold">Demande envoyée</p>
          <p className="mt-2 text-sm text-foreground/75">
            Éric Bruno va examiner votre demande et vous proposera des agents
            adaptés sous 72h ouvrées.
          </p>
          <Button className="mt-5" onClick={() => router.push("/entreprise/tableau-de-bord")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Nouvelle demande entreprise
      </h1>
      <p className="mt-2 text-foreground/75">
        Décrivez votre besoin, y compris pour plusieurs agents simultanément.
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="number_of_agents">Nombre d&rsquo;agents requis</Label>
                <Input
                  id="number_of_agents"
                  type="number"
                  min={1}
                  value={numberOfAgents}
                  onChange={(e) => setNumberOfAgents(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Quartier</Label>
                <Select value={quartierId} onValueChange={(v) => setQuartierId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoQuartiers.map((q) => (
                      <SelectItem key={q.id} value={String(q.id)}>
                        {q.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Label htmlFor="duration">Durée du contrat souhaitée</Label>
                <Input
                  id="duration"
                  placeholder="Ex: 6 mois, indéterminée..."
                  value={contractDuration}
                  onChange={(e) => setContractDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sector">Contraintes sectorielles</Label>
              <Textarea
                id="sector"
                placeholder="Ex: normes d'hygiène clinique, horaires stricts, accès sécurisé..."
                value={sectorConstraints}
                onChange={(e) => setSectorConstraints(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="spec_doc">Cahier des charges (optionnel)</Label>
              <Input
                id="spec_doc"
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setSpecDoc(e.target.files?.[0] ?? null)}
              />
              {specDoc && <p className="text-xs text-verified">{specDoc.name} sélectionné</p>}
            </div>

            <Button type="submit" className="w-full">
              Envoyer ma demande
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
