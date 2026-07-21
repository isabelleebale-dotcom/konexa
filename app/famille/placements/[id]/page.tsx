"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TrustBadge } from "@/components/konexa/verified-badge"
import {
  demoAgents,
  demoFamillePlacements,
  quartierName,
  serviceLabels,
} from "@/lib/demo-data"

const ISSUE_REASONS = [
  "Retard récurrent",
  "Absence",
  "Comportement inapproprié",
  "Incompatibilité",
  "Autre",
]

export default function PlacementTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const placement = demoFamillePlacements.find((p) => p.id === id)
  if (!placement) notFound()
  const agent = demoAgents.find((a) => a.id === placement.agent_id)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewSent, setReviewSent] = useState(false)

  const [issueReason, setIssueReason] = useState(ISSUE_REASONS[0])
  const [issueDescription, setIssueDescription] = useState("")
  const [issueSent, setIssueSent] = useState(false)

  const [replacementRequested, setReplacementRequested] = useState(false)

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(placement.start_date).getTime()) / (1000 * 60 * 60 * 24)
  )
  const guaranteeActive = new Date(placement.replacement_guarantee_expires_at) > new Date()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Suivi du placement</h1>
        <Badge variant="secondary">{placement.status === "active" ? "Actif" : placement.status}</Badge>
      </div>

      <Card className="mt-6">
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="size-14 rounded-sm">
            <AvatarFallback className="rounded-sm">{agent?.first_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading text-lg font-semibold">{agent?.first_name}</p>
            <p className="text-sm text-muted-foreground">
              {serviceLabels[placement.service_type]} · {quartierName(placement.quartier_id)}
            </p>
            {agent?.trust_tier && <TrustBadge tier={agent.trust_tier} className="mt-1.5" />}
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        Débuté le {new Date(placement.start_date).toLocaleDateString("fr-FR")} ({daysSinceStart} jours) ·{" "}
        {guaranteeActive
          ? "Garantie de remplacement gratuit active (30 premiers jours)"
          : "Garantie de remplacement gratuit expirée"}
      </p>

      {/* Avis */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Laisser un avis</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewSent ? (
            <p className="text-sm text-foreground/75">Merci, votre avis a été publié sur le profil de {agent?.first_name}.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`text-2xl ${n <= rating ? "text-primary" : "text-muted-foreground/40"}`}
                    aria-label={`${n} étoiles`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Votre expérience avec cet agent..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Button disabled={rating === 0} onClick={() => setReviewSent(true)}>
                Publier l&rsquo;avis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signalement */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Signaler un problème</CardTitle>
        </CardHeader>
        <CardContent>
          {issueSent ? (
            <p className="text-sm text-foreground/75">
              Signalement envoyé à KONEXA. Vous serez contacté(e) rapidement.
            </p>
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

      {/* Remplacement */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Demander un remplacement</CardTitle>
        </CardHeader>
        <CardContent>
          {replacementRequested ? (
            <p className="text-sm text-foreground/75">
              Demande envoyée.{" "}
              {guaranteeActive
                ? "Un nouvel agent vous sera proposé sous 48h, sans frais."
                : "Des frais de remplacement express (15 000 FCFA) s'appliquent hors garantie 30 jours."}
            </p>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-foreground/75">
                {guaranteeActive
                  ? "Gratuit pendant les 30 premiers jours — remplacement sous 48h."
                  : "Hors garantie : frais de remplacement express de 15 000 FCFA."}
              </p>
              <Button variant="outline" onClick={() => setReplacementRequested(true)}>
                Demander
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
