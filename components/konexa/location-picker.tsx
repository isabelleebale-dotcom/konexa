"use client"

import { useState } from "react"
import { X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { demoQuartiers } from "@/lib/demo-data"
import {
  villes,
  arrondissementsForVille,
  DOUALA_ARRONDISSEMENT_QUARTIERS,
} from "@/lib/locations"

/** Id du quartier générique "Autre" — voir lib/demo-data.ts. */
const AUTRE_QUARTIER_ID = 24

type SingleProps = {
  mode: "single"
  value: string
  onChange: (quartierId: string) => void
  freeText?: string
  onFreeTextChange?: (text: string) => void
}

type MultiProps = {
  mode: "multi"
  value: number[]
  onChange: (quartierIds: number[]) => void
  freeText?: string
  onFreeTextChange?: (text: string) => void
}

export function LocationPicker(props: SingleProps | MultiProps) {
  const [villeId, setVilleId] = useState("")
  const [arrondissementId, setArrondissementId] = useState("")

  const arrondissementOptions = villeId ? arrondissementsForVille(villeId) : []
  const quartierNames = DOUALA_ARRONDISSEMENT_QUARTIERS[arrondissementId] ?? []
  const quartiersInArrondissement = demoQuartiers.filter((q) => quartierNames.includes(q.name))
  const hasQuartiers = arrondissementId !== "" && quartiersInArrondissement.length > 0

  function handleVilleChange(v: string | null) {
    setVilleId(v ?? "")
    setArrondissementId("")
  }

  function handleFreeTextChange(text: string) {
    props.onFreeTextChange?.(text)
    // Rattache automatiquement au quartier générique "Autre" dès qu'un
    // texte est saisi, pour garder une clé étrangère valide en base.
    if (props.mode === "single") {
      props.onChange(text ? String(AUTRE_QUARTIER_ID) : "")
    } else if (text && !props.value.includes(AUTRE_QUARTIER_ID)) {
      props.onChange([...props.value, AUTRE_QUARTIER_ID])
    } else if (!text) {
      props.onChange(props.value.filter((id) => id !== AUTRE_QUARTIER_ID))
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Ville</Label>
          <Select value={villeId} onValueChange={handleVilleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir une ville" />
            </SelectTrigger>
            <SelectContent>
              {villes.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Arrondissement</Label>
          <Select
            value={arrondissementId}
            onValueChange={(v) => setArrondissementId(v ?? "")}
            disabled={!villeId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={villeId ? "Choisir un arrondissement" : "Choisissez d'abord une ville"} />
            </SelectTrigger>
            <SelectContent>
              {arrondissementOptions.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {arrondissementId && !hasQuartiers && (
        <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
          Bientôt disponible dans cet arrondissement — KONEXA n&rsquo;opère
          pour l&rsquo;instant que dans certains arrondissements de Douala.
        </p>
      )}

      {hasQuartiers && props.mode === "single" && (
        <div className="space-y-1.5">
          <Label>Quartier</Label>
          <Select value={props.value} onValueChange={(v) => props.onChange(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez votre quartier" />
            </SelectTrigger>
            <SelectContent>
              {quartiersInArrondissement.map((q) => (
                <SelectItem key={q.id} value={String(q.id)}>
                  {q.name}
                  {q.travel_fee > 0 && ` (+${q.travel_fee.toLocaleString("fr-FR")} FCFA)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {hasQuartiers && props.mode === "multi" && (
        <div className="space-y-2">
          <Label>Quartiers dans cet arrondissement</Label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border border-border p-3 sm:grid-cols-3">
            {quartiersInArrondissement.map((q) => {
              const checked = props.value.includes(q.id)
              return (
                <label key={q.id} className="flex items-center gap-2 text-sm text-foreground/85">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      props.onChange(
                        checked ? props.value.filter((id) => id !== q.id) : [...props.value, q.id]
                      )
                    }
                  />
                  {q.name}
                </label>
              )
            })}
          </div>
        </div>
      )}

      {props.onFreeTextChange && (
        <div className="space-y-1.5">
          <Label htmlFor="quartier_autre" className="text-muted-foreground">
            Votre quartier n&rsquo;est pas dans la liste ?
          </Label>
          <Input
            id="quartier_autre"
            placeholder="Précisez votre quartier ici"
            value={props.freeText ?? ""}
            onChange={(e) => handleFreeTextChange(e.target.value)}
          />
        </div>
      )}

      {props.mode === "multi" && props.value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {props.value.map((id) => {
            const q =
              id === AUTRE_QUARTIER_ID && props.freeText
                ? { id, name: props.freeText }
                : demoQuartiers.find((qq) => qq.id === id)
            if (!q) return null
            return (
              <span
                key={id}
                className="flex items-center gap-1 rounded-sm border border-border bg-secondary/40 px-2 py-1 text-xs"
              >
                {q.name}
                <button
                  type="button"
                  onClick={() => props.onChange(props.value.filter((v) => v !== id))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Retirer ${q.name}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
