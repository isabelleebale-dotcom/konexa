import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentApplicationForm } from "@/components/konexa/agent-application-form"

export default function DevenirAgentPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Rejoindre le réseau KONEXA
      </h1>
      <p className="mt-2 text-foreground/75">
        Inscription 100&nbsp;% gratuite. Aucun frais, aucune retenue sur
        salaire — la commission est facturée au client, jamais à vous.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Formulaire de candidature</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentApplicationForm />
        </CardContent>
      </Card>
    </div>
  )
}
