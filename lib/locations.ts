/**
 * Hiérarchie Ville → Arrondissement → Quartier, pour les 10 régions du
 * Cameroun. Douala (et Yaoundé) ont leurs vrais arrondissements ; les
 * autres villes n'ont qu'un seul arrondissement générique en attendant
 * une couverture réelle — mieux vaut ça que d'inventer des noms précis
 * sans source fiable. Seul Douala a de vrais quartiers pour l'instant
 * (voir demoQuartiers dans lib/demo-data.ts, qui reflète la table
 * `quartiers` réelle) — KONEXA n'opère qu'à Douala en V1.
 */

export type Ville = { id: string; name: string; region: string }

export const villes: Ville[] = [
  { id: "douala", name: "Douala", region: "Littoral" },
  { id: "yaounde", name: "Yaoundé", region: "Centre" },
  { id: "bafoussam", name: "Bafoussam", region: "Ouest" },
  { id: "bamenda", name: "Bamenda", region: "Nord-Ouest" },
  { id: "buea", name: "Buea", region: "Sud-Ouest" },
  { id: "ngaoundere", name: "Ngaoundéré", region: "Adamaoua" },
  { id: "bertoua", name: "Bertoua", region: "Est" },
  { id: "maroua", name: "Maroua", region: "Extrême-Nord" },
  { id: "garoua", name: "Garoua", region: "Nord" },
  { id: "ebolowa", name: "Ebolowa", region: "Sud" },
]

export type Arrondissement = { id: string; name: string; villeId: string }

export const arrondissements: Arrondissement[] = [
  // Douala — 5 arrondissements réels
  { id: "douala-1", name: "Douala 1er", villeId: "douala" },
  { id: "douala-2", name: "Douala 2e", villeId: "douala" },
  { id: "douala-3", name: "Douala 3e", villeId: "douala" },
  { id: "douala-4", name: "Douala 4e", villeId: "douala" },
  { id: "douala-5", name: "Douala 5e", villeId: "douala" },
  // Yaoundé — 7 arrondissements réels (pas encore de quartiers couverts)
  { id: "yaounde-1", name: "Yaoundé 1er", villeId: "yaounde" },
  { id: "yaounde-2", name: "Yaoundé 2e", villeId: "yaounde" },
  { id: "yaounde-3", name: "Yaoundé 3e", villeId: "yaounde" },
  { id: "yaounde-4", name: "Yaoundé 4e", villeId: "yaounde" },
  { id: "yaounde-5", name: "Yaoundé 5e", villeId: "yaounde" },
  { id: "yaounde-6", name: "Yaoundé 6e", villeId: "yaounde" },
  { id: "yaounde-7", name: "Yaoundé 7e", villeId: "yaounde" },
  // Autres villes — pas encore couvertes, un seul arrondissement générique
  // en attendant (plutôt que d'inventer un découpage précis non vérifié).
  { id: "bafoussam-centre", name: "Bafoussam", villeId: "bafoussam" },
  { id: "bamenda-centre", name: "Bamenda", villeId: "bamenda" },
  { id: "buea-centre", name: "Buea", villeId: "buea" },
  { id: "ngaoundere-centre", name: "Ngaoundéré", villeId: "ngaoundere" },
  { id: "bertoua-centre", name: "Bertoua", villeId: "bertoua" },
  { id: "maroua-centre", name: "Maroua", villeId: "maroua" },
  { id: "garoua-centre", name: "Garoua", villeId: "garoua" },
  { id: "ebolowa-centre", name: "Ebolowa", villeId: "ebolowa" },
]

/**
 * Quartiers (par nom, voir demoQuartiers) rattachés à chaque arrondissement.
 * Douala a une vraie répartition par quartier ; Yaoundé et Bafoussam n'ont
 * pour l'instant qu'une couverture au niveau de l'arrondissement lui-même
 * (pas de découpage plus fin vérifié) — chaque arrondissement y est donc
 * son propre "quartier" en attendant une couverture plus précise.
 */
export const ARRONDISSEMENT_QUARTIERS: Record<string, string[]> = {
  "douala-1": ["Akwa", "Bonanjo", "Bonapriso", "Deïdo", "Bali"],
  "douala-2": ["New Bell", "Bepanda"],
  "douala-3": ["Logbaba", "Ndogbong", "Yassa", "PK8", "PK9", "PK10", "PK11", "PK12", "PK13", "PK14"],
  "douala-4": [],
  "douala-5": ["Kotto", "Makepe", "Bonamoussadi", "Ndokoti", "Logpom", "Cité des Palmiers"],
  "yaounde-1": ["Yaoundé 1er"],
  "yaounde-2": ["Yaoundé 2e"],
  "yaounde-3": ["Yaoundé 3e"],
  "yaounde-4": ["Yaoundé 4e"],
  "yaounde-5": ["Yaoundé 5e"],
  "yaounde-6": ["Yaoundé 6e"],
  "yaounde-7": ["Yaoundé 7e"],
  "bafoussam-centre": ["Bafoussam"],
}

export function arrondissementsForVille(villeId: string): Arrondissement[] {
  return arrondissements.filter((a) => a.villeId === villeId)
}

/** Noms de quartiers couverts par une ville (toutes ses arrondissements confondus). */
export function quartierNamesForVille(villeId: string): string[] {
  return arrondissementsForVille(villeId).flatMap((a) => ARRONDISSEMENT_QUARTIERS[a.id] ?? [])
}
