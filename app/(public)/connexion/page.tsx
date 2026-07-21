import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailOtpForm } from "@/components/konexa/email-otp-form"

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm items-center px-4 py-14">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Connexion</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connectez-vous avec votre adresse email.
          </p>
        </CardHeader>
        <CardContent>
          <Suspense>
            <EmailOtpForm next={next} />
          </Suspense>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-medium text-primary">
              Inscrivez-vous
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
