import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SignupForm } from "@/components/konexa/signup-form"

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm items-center px-4 py-14">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Créer un compte</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pour réserver du personnel vérifié pour votre famille ou votre
            entreprise.
          </p>
        </CardHeader>
        <CardContent>
          <SignupForm next={next} />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-medium text-primary">
              Connectez-vous
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Vous cherchez un emploi ?{" "}
            <Link href="/devenir-agent" className="font-medium text-primary">
              Postulez ici
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
