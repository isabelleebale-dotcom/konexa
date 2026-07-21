import { FamilleNav } from "@/components/konexa/famille-nav"
import { DemoBanner } from "@/components/konexa/demo-banner"

export default function FamilleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col">
      <DemoBanner />
      <FamilleNav />
      <main className="flex-1 bg-secondary/20">{children}</main>
    </div>
  )
}
