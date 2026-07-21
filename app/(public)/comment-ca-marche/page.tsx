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

      <div className="mt-16 rounded-md border border-border bg-card p-8 text-center">
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
