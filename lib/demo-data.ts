import type { AgentPublic, AgentReviewPublic, Quartier } from "@/lib/supabase/types"

/**
 * Stand-in for the real agents_public / agent_reviews_public / quartiers
 * queries until a Supabase project exists (see .env.local.example). Swap
 * for lib/supabase/client.ts or server.ts queries once credentials land —
 * shapes match the real views exactly so the swap is a drop-in.
 */

export const demoQuartiers: Quartier[] = [
  { id: 1, name: "Akwa", is_active: true, travel_fee: 0 },
  { id: 2, name: "Bonanjo", is_active: true, travel_fee: 0 },
  { id: 3, name: "Bonapriso", is_active: true, travel_fee: 0 },
  { id: 4, name: "Deïdo", is_active: true, travel_fee: 0 },
  { id: 5, name: "Bali", is_active: true, travel_fee: 0 },
  { id: 6, name: "Makepe", is_active: true, travel_fee: 0 },
  { id: 7, name: "Bonamoussadi", is_active: true, travel_fee: 0 },
  { id: 8, name: "Bepanda", is_active: true, travel_fee: 0 },
  { id: 9, name: "New Bell", is_active: true, travel_fee: 0 },
  { id: 10, name: "Ndokoti", is_active: true, travel_fee: 0 },
  { id: 11, name: "Kotto", is_active: true, travel_fee: 0 },
  { id: 12, name: "Logpom", is_active: true, travel_fee: 5000 },
  { id: 13, name: "Logbaba", is_active: true, travel_fee: 5000 },
  { id: 14, name: "Ndogbong", is_active: true, travel_fee: 5000 },
  { id: 15, name: "Cité des Palmiers", is_active: true, travel_fee: 5000 },
  { id: 16, name: "Yassa", is_active: true, travel_fee: 7000 },
  { id: 17, name: "PK8", is_active: true, travel_fee: 7000 },
  { id: 18, name: "PK9", is_active: true, travel_fee: 7000 },
  { id: 19, name: "PK10", is_active: true, travel_fee: 7000 },
  { id: 20, name: "PK11", is_active: true, travel_fee: 8000 },
  { id: 21, name: "PK12", is_active: true, travel_fee: 8000 },
  { id: 22, name: "PK13", is_active: true, travel_fee: 8000 },
  { id: 23, name: "PK14", is_active: true, travel_fee: 8000 },
  { id: 24, name: "Autre", is_active: true, travel_fee: 0 },
]

export const serviceLabels: Record<AgentPublic["service_type"], string> = {
  menagere: "Ménagère",
  nounou: "Nounou",
  agent_entretien: "Agent d'entretien",
}

export const demoAgents: AgentPublic[] = [
  {
    id: "a1",
    first_name: "Cécile",
    photo_url: null,
    service_type: "menagere",
    bio: "4 ans d'expérience dans 3 familles à Douala. Minutieuse, ponctuelle, disponible temps plein.",
    experience_years: 4,
    quartier_ids: [7, 6, 12],
    availability: true,
    status: "validated",
    trust_tier: "verified_plus",
  },
  {
    id: "a2",
    first_name: "Larissa",
    photo_url: null,
    service_type: "nounou",
    bio: "6 ans auprès d'enfants de 0 à 8 ans. Formée aux premiers secours pédiatriques.",
    experience_years: 6,
    quartier_ids: [1, 2, 3],
    availability: true,
    status: "validated",
    trust_tier: "premium",
  },
  {
    id: "a3",
    first_name: "Joseph",
    photo_url: null,
    service_type: "agent_entretien",
    bio: "Expérience en entretien de bureaux et cliniques. Respect strict des normes d'hygiène.",
    experience_years: 5,
    quartier_ids: [1, 2, 3, 5],
    availability: true,
    status: "active",
    trust_tier: "verified_plus",
  },
  {
    id: "a4",
    first_name: "Solange",
    photo_url: null,
    service_type: "menagere",
    bio: "8 ans d'expérience. Autonome, cuisine camerounaise, repassage soigné.",
    experience_years: 8,
    quartier_ids: [3, 2],
    availability: false,
    status: "active",
    trust_tier: "premium",
  },
  {
    id: "a5",
    first_name: "Aïcha",
    photo_url: null,
    service_type: "nounou",
    bio: "3 ans d'expérience, spécialisée petite enfance (0-3 ans). Patiente et rigoureuse.",
    experience_years: 3,
    quartier_ids: [6, 7, 9],
    availability: true,
    status: "validated",
    trust_tier: "verified",
  },
  {
    id: "a6",
    first_name: "Patrick",
    photo_url: null,
    service_type: "agent_entretien",
    bio: "10 ans en entretien hôtelier et médical. Disponible pour contrats de nuit.",
    experience_years: 10,
    quartier_ids: [10, 13, 14],
    availability: true,
    status: "validated",
    trust_tier: "verified_plus",
  },
  {
    id: "a7",
    first_name: "Rita",
    photo_url: null,
    service_type: "menagere",
    bio: "5 ans d'expérience du côté PK, dispo pour missions dans toute la zone PK8-PK11.",
    experience_years: 5,
    quartier_ids: [17, 18, 19, 20],
    availability: true,
    status: "validated",
    trust_tier: "verified",
  },
]

export const demoReviews: AgentReviewPublic[] = [
  {
    id: "r1",
    agent_id: "a1",
    client_first_name: "Aminata",
    rating: 5,
    comment: "Très sérieuse et ponctuelle. Je recommande sans hésiter.",
    published_at: "2026-05-12",
  },
  {
    id: "r2",
    agent_id: "a1",
    client_first_name: "Danielle",
    rating: 4,
    comment: "Bon travail, s'adapte bien aux consignes.",
    published_at: "2026-04-02",
  },
  {
    id: "r3",
    agent_id: "a2",
    client_first_name: "Ruth",
    rating: 5,
    comment: "Mes enfants l'adorent. Très rassurante et professionnelle.",
    published_at: "2026-06-01",
  },
  {
    id: "r4",
    agent_id: "a3",
    client_first_name: "M. Fotso",
    rating: 5,
    comment: "Travail impeccable dans notre clinique, respecte les protocoles.",
    published_at: "2026-03-20",
  },
]

// ============================================================
// Espace famille (démo) — un client fictif "vous" avec un placement actif,
// une proposition en attente, et une demande non traitée.
// ============================================================

export type DemoPlacement = {
  id: string
  agent_id: string
  agent_first_name: string
  service_type: AgentPublic["service_type"]
  quartier_id: number
  salary_monthly: number
  placement_fee_amount: number
  start_date: string
  status: "pending_payment" | "active" | "replacement_in_progress" | "completed" | "cancelled"
  replacement_guarantee_expires_at: string
}

export type DemoRequest = {
  id: string
  service_type: AgentPublic["service_type"]
  quartier_id: number
  frequency: string
  desired_start_date: string
  budget_max: number | null
  status: "submitted" | "proposed" | "accepted" | "payment_pending" | "fulfilled" | "cancelled"
  created_at: string
  proposed_agent_id?: string
}

export type DemoPayment = {
  id: string
  placement_id: string
  type: "placement_fee" | "monthly_commission" | "express_replacement_fee"
  amount: number
  status: "pending" | "processing" | "confirmed" | "failed" | "refunded"
  paid_at: string | null
  created_at: string
}

export const demoFamillePlacements: DemoPlacement[] = [
  {
    id: "p1",
    agent_id: "a1",
    agent_first_name: "Cécile",
    service_type: "menagere",
    quartier_id: 7,
    salary_monthly: 45_000,
    placement_fee_amount: 30_000,
    start_date: "2026-06-01",
    status: "active",
    replacement_guarantee_expires_at: "2026-07-01",
  },
]

export const demoFamilleRequests: DemoRequest[] = [
  {
    id: "req1",
    service_type: "nounou",
    quartier_id: 1,
    frequency: "Temps plein, lundi-vendredi",
    desired_start_date: "2026-08-01",
    budget_max: 50_000,
    status: "proposed",
    created_at: "2026-07-10",
    proposed_agent_id: "a2",
  },
  {
    id: "req2",
    service_type: "agent_entretien",
    quartier_id: 3,
    frequency: "3x/semaine",
    desired_start_date: "2026-08-05",
    budget_max: 35_000,
    status: "submitted",
    created_at: "2026-07-13",
  },
]

export const demoFamillePayments: DemoPayment[] = [
  {
    id: "pay1",
    placement_id: "p1",
    type: "placement_fee",
    amount: 30_000,
    status: "confirmed",
    paid_at: "2026-05-30",
    created_at: "2026-05-30",
  },
  {
    id: "pay2",
    placement_id: "p1",
    type: "monthly_commission",
    amount: 4_500,
    status: "confirmed",
    paid_at: "2026-07-01",
    created_at: "2026-07-01",
  },
]

// ============================================================
// Espace entreprise (démo) — M. Fotso, clinique à Akwa, 2 agents
// d'entretien affectés + une demande en cours + facturation mensuelle.
// ============================================================

export type DemoPresenceStatus = "present" | "absent" | "late"

export type DemoPresenceRecord = {
  date: string
  status: DemoPresenceStatus
}

export type DemoEntreprisePlacement = DemoPlacement & {
  presence: DemoPresenceRecord[]
}

export type DemoInvoiceLineItem = {
  description: string
  amount: number
}

export type DemoInvoice = {
  id: string
  period_month: number
  period_year: number
  total_amount: number
  status: "draft" | "issued" | "paid" | "overdue"
  line_items: DemoInvoiceLineItem[]
}

export const demoEntreprisePlacements: DemoEntreprisePlacement[] = [
  {
    id: "ep1",
    agent_id: "a3",
    agent_first_name: "Joseph",
    service_type: "agent_entretien",
    quartier_id: 2,
    salary_monthly: 60_000,
    placement_fee_amount: 40_000,
    start_date: "2026-05-01",
    status: "active",
    replacement_guarantee_expires_at: "2026-05-31",
    presence: [
      { date: "2026-07-10", status: "present" },
      { date: "2026-07-11", status: "present" },
      { date: "2026-07-12", status: "late" },
      { date: "2026-07-13", status: "present" },
      { date: "2026-07-14", status: "absent" },
    ],
  },
  {
    id: "ep2",
    agent_id: "a6",
    agent_first_name: "Patrick",
    service_type: "agent_entretien",
    quartier_id: 9,
    salary_monthly: 65_000,
    placement_fee_amount: 40_000,
    start_date: "2026-04-15",
    status: "active",
    replacement_guarantee_expires_at: "2026-05-15",
    presence: [
      { date: "2026-07-10", status: "present" },
      { date: "2026-07-11", status: "present" },
      { date: "2026-07-12", status: "present" },
      { date: "2026-07-13", status: "present" },
      { date: "2026-07-14", status: "present" },
    ],
  },
]

export const demoEntrepriseRequests: DemoRequest[] = [
  {
    id: "req-ent1",
    service_type: "agent_entretien",
    quartier_id: 2,
    frequency: "Quotidien, contrat de nuit",
    desired_start_date: "2026-08-01",
    budget_max: 70_000,
    status: "submitted",
    created_at: "2026-07-12",
  },
]

export const demoEntrepriseInvoices: DemoInvoice[] = [
  {
    id: "inv1",
    period_month: 6,
    period_year: 2026,
    total_amount: 12_500,
    status: "paid",
    line_items: [
      { description: "Joseph — commission (10% de 60 000 FCFA)", amount: 6_000 },
      { description: "Patrick — commission (10% de 65 000 FCFA)", amount: 6_500 },
    ],
  },
  {
    id: "inv2",
    period_month: 7,
    period_year: 2026,
    total_amount: 12_500,
    status: "issued",
    line_items: [
      { description: "Joseph — commission (10% de 60 000 FCFA)", amount: 6_000 },
      { description: "Patrick — commission (10% de 65 000 FCFA)", amount: 6_500 },
    ],
  },
]

export function quartierName(id: number | null): string {
  return demoQuartiers.find((q) => q.id === id)?.name ?? "Douala"
}

export function quartierNames(ids: number[]): string[] {
  return ids.map((id) => quartierName(id))
}

export function travelFeeFor(id: number | null): number {
  return demoQuartiers.find((q) => q.id === id)?.travel_fee ?? 0
}
