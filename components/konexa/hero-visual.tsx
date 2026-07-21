import { MapPin, ShieldCheck, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

const STATS = [
  {
    icon: MapPin,
    title: "24 quartiers",
    subtitle: "couverts à Douala",
    iconColorDark: "text-[#C4B5FD]",
    iconColorLight: "text-primary",
  },
  {
    icon: ShieldCheck,
    title: "3 niveaux",
    subtitle: "de vérification",
    iconColorDark: "text-verified",
    iconColorLight: "text-verified",
  },
  {
    icon: Smartphone,
    title: "MoMo & OM",
    subtitle: "paiement mobile",
    iconColorDark: "text-[#C4B5FD]",
    iconColorLight: "text-primary",
  },
] as const

export function HeroVisual({ dark }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border p-5",
        dark ? "border-white/15 bg-white/5 backdrop-blur-md" : "border-border bg-secondary/40"
      )}
    >
      {STATS.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.title}
            className={cn(
              "flex items-center gap-3 rounded-md px-4 py-3.5 shadow-lg",
              dark
                ? "border border-white/15 bg-white/10 backdrop-blur-md"
                : "border border-border bg-card"
            )}
          >
            <Icon
              className={cn("size-5 shrink-0", dark ? stat.iconColorDark : stat.iconColorLight)}
              aria-hidden="true"
            />
            <div>
              <p className={cn("text-sm font-semibold leading-tight", dark && "text-white")}>
                {stat.title}
              </p>
              <p className={cn("text-xs leading-tight", dark ? "text-white/60" : "text-muted-foreground")}>
                {stat.subtitle}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
