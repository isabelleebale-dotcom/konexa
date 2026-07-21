"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/entreprise/tableau-de-bord", label: "Tableau de bord" },
  { href: "/entreprise/demandes/nouvelle", label: "Nouvelle demande" },
  { href: "/entreprise/agents", label: "Agents affectés" },
  { href: "/entreprise/facturation", label: "Facturation" },
]

export function EntrepriseNav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/entreprise/tableau-de-bord" className="font-heading text-lg font-semibold">
          KONEXA <span className="text-muted-foreground font-normal">— Entreprise</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-foreground/70 hover:text-foreground",
                pathname.startsWith(link.href) && "font-medium text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
