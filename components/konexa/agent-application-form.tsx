"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { createClient } from "@/lib/supabase/client"
import { serviceLabels } from "@/lib/demo-data"
import type { AgentPublic, DocType } from "@/lib/supabase/types"

type Reference = { fullName: string; relationship: string; phone: string }

const RELATIONSHIPS = ["Ancien employeur", "Proche", "Autre"]

function FileField({
  id,
  label,
  hint,
  file,
  onChange,
  required,
}: {
  id: string
  label: string
  hint?: string
  file: File | null
  onChange: (file: File | null) => void
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <Input
        id={id}
        type="file"
        accept="image/*,application/pdf"
        required={required}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {file && <p className="text-xs text-verified">{file.name} sélectionné</p>}
    </div>
  )
}

async function uploadDocument(
  supabase: ReturnType<typeof createClient>,
  agentId: string,
  file: File,
  docType: DocType
) {
  const path = `${agentId}/${docType}-${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage
    .from("agent-documents")
    .upload(path, file)
  if (uploadError) return { error: uploadError }

  return supabase.from("agent_documents").insert({
    agent_id: agentId,
    doc_type: docType,
    storage_path: path,
  })
}

export function AgentApplicationForm() {
  const router = useRouter()

  const [step, setStep] = useState<"details" | "uploading" | "done">("details")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [serviceType, setServiceType] =
    useState<AgentPublic["service_type"]>("menagere")
  const [experienceYears, setExperienceYears] = useState("")
  const [quartierIds, setQuartierIds] = useState<number[]>([])
  const [quartierFreeText, setQuartierFreeText] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vérification d'identité
  const [idDocType, setIdDocType] = useState<"id_card" | "passport">("id_card")
  const [idDocFile, setIdDocFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [criminalRecordFile, setCriminalRecordFile] = useState<File | null>(null)

  // Localisation approximative (usage interne KONEXA uniquement)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle")

  // Références
  const [reference1, setReference1] = useState<Reference>({
    fullName: "",
    relationship: RELATIONSHIPS[0],
    phone: "",
  })
  const [addSecondRef, setAddSecondRef] = useState(false)
  const [reference2, setReference2] = useState<Reference>({
    fullName: "",
    relationship: RELATIONSHIPS[0],
    phone: "",
  })

  function shareLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("denied")
      return
    }
    setGeoStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoStatus("granted")
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 }
    )
  }

  async function submitDetails(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch("/api/auth/instant-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role: "agent",
        first_name: firstName,
        last_name: lastName,
        phone,
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

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone,
        service_type: serviceType,
        bio: quartierFreeText ? `${bio}\n\nZone supplémentaire précisée : ${quartierFreeText}` : bio,
        experience_years: Number(experienceYears) || 0,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        criminal_record_provided: !!criminalRecordFile,
      })
      .select("id")
      .single()

    if (agentError || !agent) {
      setLoading(false)
      setError("Votre compte est créé, mais l'envoi du profil a échoué. Réessayez depuis votre espace agent.")
      return
    }

    const agentId = (agent as { id: string }).id
    setStep("uploading")

    if (quartierIds.length > 0) {
      await supabase.from("agent_quartiers").insert(
        quartierIds.map((quartier_id) => ({ agent_id: agentId, quartier_id }))
      )
    }

    if (photoFile) {
      const path = `${agentId}/photo-${Date.now()}-${photoFile.name}`
      const { error: photoError } = await supabase.storage
        .from("agent-photos")
        .upload(path, photoFile)
      if (!photoError) {
        const { data: publicUrl } = supabase.storage.from("agent-photos").getPublicUrl(path)
        await supabase.from("agents").update({ photo_url: publicUrl.publicUrl }).eq("id", agentId)
      }
    }

    if (idDocFile) await uploadDocument(supabase, agentId, idDocFile, idDocType)
    if (cvFile) await uploadDocument(supabase, agentId, cvFile, "cv")
    if (selfieFile) await uploadDocument(supabase, agentId, selfieFile, "selfie_with_id")
    if (criminalRecordFile) await uploadDocument(supabase, agentId, criminalRecordFile, "criminal_record")

    const references = [reference1, ...(addSecondRef ? [reference2] : [])].filter(
      (r) => r.fullName && r.phone
    )
    if (references.length > 0) {
      await supabase.from("agent_references").insert(
        references.map((r) => ({
          agent_id: agentId,
          full_name: r.fullName,
          relationship: r.relationship,
          phone: r.phone,
        }))
      )
    }

    setLoading(false)
    setStep("done")
  }

  if (step === "done") {
    return (
      <div className="rounded-md border border-border bg-secondary/30 p-6 text-center">
        <p className="font-heading text-lg font-semibold">Candidature envoyée</p>
        <p className="mt-2 text-sm text-foreground/75">
          Merci ! Votre dossier (identité, documents, références) sera examiné
          personnellement par KONEXA. Vous serez averti(e) par email dès qu&rsquo;il
          sera validé et visible dans le catalogue.
        </p>
        <Button className="mt-5" onClick={() => router.push("/")}>
          Retour à l&rsquo;accueil
        </Button>
      </div>
    )
  }

  if (step === "uploading") {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Envoi de votre dossier en cours…
      </p>
    )
  }

  return (
    <form onSubmit={submitDetails} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">Prénom</Label>
            <Input id="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Nom</Label>
            <Input id="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div className="grid grid-cols-2 gap-3">
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
            <Label htmlFor="experience">Années d&rsquo;expérience</Label>
            <Input
              id="experience"
              type="number"
              min={0}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Zones où vous acceptez des missions</Label>
          <p className="text-xs text-muted-foreground">
            Choisissez une ville, puis un département pour trouver vos
            quartiers — plus vous en cochez, plus vous recevrez de
            propositions.
          </p>
          <LocationPicker
            mode="multi"
            value={quartierIds}
            onChange={setQuartierIds}
            freeText={quartierFreeText}
            onFreeTextChange={setQuartierFreeText}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Présentez votre expérience</Label>
          <Textarea
            id="bio"
            placeholder="Familles précédentes, compétences, disponibilités..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            required
          />
        </div>
      </div>

      {/* Vérification d'identité */}
      <div className="space-y-4 border-t border-border pt-5">
        <div>
          <p className="font-medium">Vérification d&rsquo;identité</p>
          <p className="text-xs text-muted-foreground">
            Ces documents sont examinés uniquement par l&rsquo;équipe KONEXA —
            jamais visibles des clients, qui ne voient que votre badge de
            confiance.
          </p>
        </div>

        <FileField
          id="photo"
          label="Photo de profil récente"
          file={photoFile}
          onChange={setPhotoFile}
          required
        />

        <div className="space-y-1.5">
          <Label>Type de pièce d&rsquo;identité</Label>
          <Select value={idDocType} onValueChange={(v) => v && setIdDocType(v as typeof idDocType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id_card">Carte nationale d&rsquo;identité (CNI)</SelectItem>
              <SelectItem value="passport">Passeport</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FileField
          id="id_doc"
          label="Photo de la pièce d'identité"
          file={idDocFile}
          onChange={setIdDocFile}
          required
        />

        <FileField
          id="selfie"
          label="Selfie tenant votre pièce d'identité"
          hint="Pour vérifier que le document vous appartient — évite les faux comptes."
          file={selfieFile}
          onChange={setSelfieFile}
          required
        />

        <FileField id="cv" label="CV" file={cvFile} onChange={setCvFile} required />

        <FileField
          id="criminal_record"
          label="Extrait de casier judiciaire"
          hint="Si disponible ou si la loi le permet — renforce votre badge (Vérifié+)."
          file={criminalRecordFile}
          onChange={setCriminalRecordFile}
        />

        <div className="space-y-1.5">
          <Label>Localisation approximative</Label>
          <p className="text-xs text-muted-foreground">
            Optionnel, usage interne KONEXA uniquement — jamais partagé avec les clients.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={shareLocation}>
            <MapPin className="size-4" />
            {geoStatus === "granted"
              ? "Position enregistrée"
              : geoStatus === "loading"
                ? "Localisation…"
                : "Partager ma position"}
          </Button>
          {geoStatus === "denied" && (
            <p className="text-xs text-destructive">
              Localisation indisponible — vous pouvez continuer sans.
            </p>
          )}
        </div>
      </div>

      {/* Références */}
      <div className="space-y-4 border-t border-border pt-5">
        <div>
          <p className="font-medium">Personnes de référence</p>
          <p className="text-xs text-muted-foreground">
            Un ancien employeur ou un proche que KONEXA peut contacter.
          </p>
        </div>

        <ReferenceFields reference={reference1} onChange={setReference1} required />

        {addSecondRef ? (
          <ReferenceFields reference={reference2} onChange={setReference2} />
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => setAddSecondRef(true)}>
            + Ajouter une deuxième référence
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Envoi…" : "S'inscrire"}
      </Button>
    </form>
  )
}

function ReferenceFields({
  reference,
  onChange,
  required,
}: {
  reference: Reference
  onChange: (r: Reference) => void
  required?: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-md border border-border p-3">
      <div className="col-span-2 space-y-1.5">
        <Label>Nom complet{required && <span className="text-destructive"> *</span>}</Label>
        <Input
          value={reference.fullName}
          onChange={(e) => onChange({ ...reference, fullName: e.target.value })}
          required={required}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Relation</Label>
        <Select
          value={reference.relationship}
          onValueChange={(v) => v && onChange({ ...reference, relationship: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RELATIONSHIPS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Téléphone{required && <span className="text-destructive"> *</span>}</Label>
        <Input
          type="tel"
          value={reference.phone}
          onChange={(e) => onChange({ ...reference, phone: e.target.value })}
          required={required}
        />
      </div>
    </div>
  )
}
