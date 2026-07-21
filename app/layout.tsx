import type { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
})

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "KONEXA — Personnel domestique vérifié à Douala",
  description:
    "Ménagères, nounous et agents d'entretien vérifiés personnellement. Réservez et payez en mobile money, sans jamais décrocher le téléphone.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`dark ${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        {/* éclairage d'ambiance très léger, fixe, commun à toutes les pages */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div
            className="absolute -left-40 -top-40 size-[32rem] rounded-full opacity-[0.12] blur-3xl"
            style={{ backgroundColor: "#7C3AED" }}
          />
          <div
            className="absolute -right-40 top-1/2 size-[28rem] rounded-full opacity-[0.08] blur-3xl"
            style={{ backgroundColor: "#3B82F6" }}
          />
          <div
            className="absolute bottom-[-10rem] left-1/3 size-[26rem] rounded-full opacity-[0.07] blur-3xl"
            style={{ backgroundColor: "#34D399" }}
          />
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
