"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  CreditCard,
  Star,
  Flag,
  Bell,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AdminSearch } from "@/components/konexa/admin-search"

const links = [
  { href: "/admin/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/agents", label: "Prestataires", icon: ShieldCheck },
  { href: "/admin/demandes", label: "Réservations", icon: ClipboardList },
  { href: "/admin/paiements", label: "Paiements", icon: CreditCard },
  { href: "/admin/avis", label: "Avis", icon: Star },
  { href: "/admin/signalements", label: "Signalements", icon: Flag },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-[#0D1526]">
      <div className="flex h-16 items-center px-5">
        <Link href="/admin/tableau-de-bord" className="font-heading text-lg font-semibold text-white">
          KONEXA <span className="font-normal text-white/50">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {links.map((link) => {
          const Icon = link.icon
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/15 font-medium text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-3 text-xs text-white/40">
        Éric Bruno · Administrateur unique
      </div>
    </div>
  )
}

export function AdminTopbar() {
  return (
    <div className="flex h-16 items-center gap-4 border-b border-white/10 bg-[#0B1120]/80 px-6 backdrop-blur-xl">
      <AdminSearch />
    </div>
  )
}
