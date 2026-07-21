import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    title: "Recherchez",
    text: "Parcourez le catalogue d'agents vérifiés, filtrez par service et par quartier — sans créer de compte.",
  },
  {
    number: "02",
    title: "Réservez",
    text: "Choisissez un agent directement, ou décrivez votre besoin pour recevoir une proposition sous 48h.",
  },
  {
    number: "03",
    title: "Payez",
    text: "Réglez les frais de placement en MTN MoMo ou Orange Money. Reçu digital immédiat.",
  },
  {
    number: "04",
    title: "Suivez",
    text: "Le placement démarre. Laissez un avis à J+7, signalez un problème, ou demandez un remplacement — garanti sous 48h pendant 30 jours.",
  },
]

const tarifs = [
  { service: "Ménagère", frais: "30 000 FCFA", commission: "10 % du salaire mensuel" },
  { service: "Nounou", frais: "50 000 FCFA", commission: "10 % du salaire mensuel" },
  { service: "Agent d'entretien (entreprise)", frais: "40 000 FCFA / agent", commission: "10 % du salaire mensuel" },
]

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Comment ça marche
      </h1>
      <p className="mt-3 max-w-xl text-foreground/75">
        Un processus simple, transparent, du premier clic au placement confirmé.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {steps.map((step) => (
          <div key={step.number}>
            <p className="font-heading text-2xl font-semibold text-primary">
              {step.number}
            </p>
            <p className="mt-1.5 font-heading text-lg font-semibold">{step.title}</p>
            <p className="mt-1.5 text-sm text-foreground/75">{step.text}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 font-heading text-2xl font-semibold tracking-tight">
        Tarifs
      </h2>
      <div className="mt-5 overflow-x-auto rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/40">
            <tr>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Frais de placement</th>
              <th className="px-4 py-3 font-medium">Commission mensuelle</th>
            </tr>
          </thead>
          <tbody>
            {tarifs.map((t) => (
              <tr key={t.service} className="border-t border-border">
                <td className="px-4 py-3">{t.service}</td>
                <td className="px-4 py-3">{t.frais}</td>
                <td className="px-4 py-3">{t.commission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Le salaire de l&rsquo;agent est versé directement par le client — KONEXA
        ne facture que les frais de placement et la commission de suivi.
        Inscription 100&nbsp;% gratuite pour les agents, aucune retenue sur salaire.
      </p>

      <div className="mt-14 rounded-md border border-border bg-card p-8 text-center">
        <p className="font-heading text-xl font-semibold">
          Prêt à trouver la bonne personne ?
        </p>
        <Button
          size="lg"
          className="mt-5"
          render={<Link href="/agents">Parcourir le catalogue</Link>}
        />
      </div>
    </div>
  )
}
