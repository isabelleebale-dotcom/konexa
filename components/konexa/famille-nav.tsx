"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/famille/tableau-de-bord", label: "Tableau de bord" },
  { href: "/famille/demandes/nouvelle", label: "Nouvelle demande" },
  { href: "/famille/paiements", label: "Paiements" },
]

export function FamilleNav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/famille/tableau-de-bord" className="font-heading text-lg font-semibold">
          KONEXA <span className="text-muted-foreground font-normal">— Famille</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-foreground/70 hover:text-foreground",
                pathname === link.href && "font-medium text-foreground"
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
