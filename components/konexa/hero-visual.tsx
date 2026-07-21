import { MapPin, ShieldCheck, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

const MOSAIC_INITIALS = ["C", "L", "J", "S", "A", "P", "R", "M", "D"]

export function HeroVisual({ dark }: { dark?: boolean }) {
  const floatingCardClass = cn(
    "absolute flex items-center gap-2 rounded-md px-3 py-2.5 shadow-lg",
    dark
      ? "border border-white/15 bg-white/10 backdrop-blur-md"
      : "border border-border bg-card"
  )

  return (
    <div className="relative">
      <div
        className={cn(
          "grid aspect-square grid-cols-3 gap-2 overflow-hidden rounded-md border p-4 sm:aspect-[4/5]",
          dark ? "border-white/15 bg-white/5 backdrop-blur-md" : "border-border bg-secondary/40"
        )}
      >
        {MOSAIC_INITIALS.map((letter, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-sm font-heading text-lg font-semibold"
            style={
              dark
                ? {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    color:
                      i % 3 === 0
                        ? "#C4B5FD"
                        : i % 3 === 1
                          ? "color-mix(in oklch, var(--verified), white 30%)"
                          : "color-mix(in oklch, var(--accent-red), white 30%)",
                  }
                : {
                    backgroundColor:
                      i % 3 === 0
                        ? "color-mix(in oklch, var(--primary), transparent 88%)"
                        : i % 3 === 1
                          ? "color-mix(in oklch, var(--verified), transparent 88%)"
                          : "color-mix(in oklch, var(--accent-red), transparent 88%)",
                    color:
                      i % 3 === 0
                        ? "var(--primary)"
                        : i % 3 === 1
                          ? "var(--verified)"
                          : "var(--accent-red)",
                  }
            }
          >
            {letter}
          </div>
        ))}
      </div>

      <div className={cn(floatingCardClass, "-right-3 -top-4 sm:-right-6")}>
        <MapPin className={cn("size-4", dark ? "text-[#C4B5FD]" : "text-primary")} aria-hidden="true" />
        <div>
          <p className={cn("text-sm font-semibold leading-tight", dark && "text-white")}>
            24 quartiers
          </p>
          <p className={cn("text-xs leading-tight", dark ? "text-white/60" : "text-muted-foreground")}>
            couverts à Douala
          </p>
        </div>
      </div>

      <div className={cn(floatingCardClass, "-bottom-4 -left-3 sm:-left-6")}>
        <ShieldCheck className="size-4 text-verified" aria-hidden="true" />
        <div>
          <p className={cn("text-sm font-semibold leading-tight", dark && "text-white")}>
            3 niveaux
          </p>
          <p className={cn("text-xs leading-tight", dark ? "text-white/60" : "text-muted-foreground")}>
            de vérification
          </p>
        </div>
      </div>

      <div className={cn(floatingCardClass, "bottom-1/3 -right-3 hidden sm:-right-6 lg:flex")}>
        <Smartphone className={cn("size-4", dark ? "text-[#C4B5FD]" : "text-primary")} aria-hidden="true" />
        <div>
          <p className={cn("text-sm font-semibold leading-tight", dark && "text-white")}>
            MoMo &amp; OM
          </p>
          <p className={cn("text-xs leading-tight", dark ? "text-white/60" : "text-muted-foreground")}>
            paiement mobile
          </p>
        </div>
      </div>
    </div>
  )
}
