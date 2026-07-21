/**
 * Once the Supabase project exists and the migration in
 * supabase/migrations/0001_init_schema.sql has been applied, generate the
 * real typed schema with:
 *
 *   npx supabase gen types typescript --project-id <project-ref> > lib/supabase/database.types.ts
 *
 * and wire it into lib/supabase/{client,server,service}.ts as the generic
 * parameter. Until then, the Supabase clients are untyped and these are
 * hand-maintained reference types for the views/tables most read in Phase 1 —
 * use them as explicit local annotations, not as the client's generic.
 */

export type TrustTier = "verified" | "verified_plus" | "premium"

export type AgentPublic = {
  id: string
  first_name: string
  photo_url: string | null
  service_type: "menagere" | "nounou" | "agent_entretien"
  bio: string | null
  experience_years: number
  /** Quartiers où l'agent accepte des missions — voir agent_quartiers. */
  quartier_ids: number[]
  availability: boolean
  status: string
  /** Badge public. null = vérification en cours, pas encore de niveau attribué. */
  trust_tier: TrustTier | null
}

export type DocType =
  | "id_card"
  | "passport"
  | "cv"
  | "criminal_record"
  | "selfie_with_id"
  | "reference_letter"
  | "other"

export type AgentReviewPublic = {
  id: string
  agent_id: string
  client_first_name: string
  rating: number
  comment: string | null
  published_at: string | null
}

export type Quartier = {
  id: number
  name: string
  is_active: boolean
  /** Supplément FCFA facturé au client pour une mission dans ce quartier. */
  travel_fee: number
}

export type Profile = {
  id: string
  role: "famille" | "entreprise" | "agent" | "admin"
  first_name: string
  last_name: string
  phone: string
  locale: string
  created_at: string
  updated_at: string
}
