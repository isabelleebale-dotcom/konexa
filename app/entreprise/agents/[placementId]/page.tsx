"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { VerifiedBadge } from "@/components/konexa/verified-badge"
import {
  demoEntreprisePlacements,
  quartierName,
  serviceLabels,
  type DemoPresenceStatus,
} from "@/lib/demo-data"

const STATUS_LABEL: Record<DemoPresenceStatus, string> = {
  present: "Présent",
  late: "En retard",
  absent: "Absent",
}

const ISSUE_REASONS = ["Retard récurrent", "Absence", "Comportement inapproprié", "Autre"]

export default function EntrepriseAgentDetailPage({
  params,
}: {
  params: Promise<{ placementId: string }>
}) {
  const { placementId } = use(params)
  const placement = demoEntreprisePlacements.find((p) => p.id === placementId)
  if (!placement) notFound()

  const [presence, setPresence] = useState(placement.presence)
  const [todayMarked, setTodayMarked] = useState(false)

  const [issueSent, setIssueSent] = useState(false)
  const [issueReason, setIssueReason] = useState(ISSUE_REASONS[0])
  const [issueDescription, setIssueDescription] = useState("")

  const [emergencyRequested, setEmergencyRequested] = useState(false)

  function markToday(status: DemoPresenceStatus) {
    const today = new Date().toISOString().slice(0, 10)
    setPresence((prev) => [...prev.filter((p) => p.date !== today), { date: today, status }])
    setTodayMarked(true)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {placement.agent_first_name}
      </h1>
      <p className="mt-1 text-foreground/75">
        {serviceLabels[placement.service_type]} · {quartierName(placement.quartier_id)}
      </p>

      <Card className="mt-6">
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="size-14 rounded-sm">
            <AvatarFallback className="rounded-sm">{placement.agent_first_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading text-lg font-semibold">{placement.agent_first_name}</p>
            <VerifiedBadge className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Présence */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Valider la présence du jour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayMarked ? (
            <p className="text-sm text-verified">Présence du jour enregistrée.</p>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => markToday("present")}>Présent</Button>
              <Button size="sm" variant="outline" onClick={() => markToday("late")}>En retard</Button>
              <Button size="sm" variant="outline" onClick={() => markToday("absent")}>Absent</Button>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">Historique récent</p>
            <div className="mt-2 space-y-1.5">
              {[...presence].reverse().map((p) => (
                <div key={p.date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(p.date).toLocaleDateString("fr-FR")}
                  </span>
                  <Badge
                    variant={
                      p.status === "present" ? "secondary" : p.status === "late" ? "outline" : "destructive"
                    }
                  >
                    {STATUS_LABEL[p.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signalement */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Signaler un problème</CardTitle>
        </CardHeader>
        <CardContent>
          {issueSent ? (
            <p className="text-sm text-foreground/75">Signalement envoyé à KONEXA.</p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Motif</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                >
                  {ISSUE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="Décrivez la situation..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={3}
              />
              <Button variant="outline" onClick={() => setIssueSent(true)}>
                Envoyer le signalement
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remplacement d'urgence */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Remplacement d&rsquo;urgence</CardTitle>
        </CardHeader>
        <CardContent>
          {emergencyRequested ? (
            <p className="text-sm text-foreground/75">
              Demande envoyée — un agent de remplacement sera proposé sous 24h.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-foreground/75">
                En cas d&rsquo;absence compromettant vos opérations (hygiène, sécurité).
              </p>
              <Button variant="outline" onClick={() => setEmergencyRequested(true)}>
                Demander en urgence
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
