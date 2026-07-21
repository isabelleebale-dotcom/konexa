import { EntrepriseNav } from "@/components/konexa/entreprise-nav"
import { DemoBanner } from "@/components/konexa/demo-banner"

export default function EntrepriseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col">
      <DemoBanner />
      <EntrepriseNav />
      <main className="flex-1 bg-secondary/20">{children}</main>
    </div>
  )
}
