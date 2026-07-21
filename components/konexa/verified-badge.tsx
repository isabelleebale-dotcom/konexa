import { BadgeCheck, ShieldCheck, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TrustTier } from "@/lib/supabase/types"

const TIER_CONFIG: Record<
  TrustTier,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  verified: {
    label: "Vérifié",
    icon: BadgeCheck,
    className: "bg-verified text-verified-foreground",
  },
  verified_plus: {
    label: "Vérifié+",
    icon: ShieldCheck,
    className: "bg-verified text-verified-foreground ring-1 ring-inset ring-verified-foreground/30",
  },
  premium: {
    label: "Premium",
    icon: Trophy,
    className: "bg-accent-red text-accent-red-foreground",
  },
}

export function TrustBadge({
  tier = "verified",
  className,
}: {
  tier?: TrustTier
  className?: string
}) {
  const config = TIER_CONFIG[tier]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label} KONEXA
    </span>
  )
}

/** @deprecated use TrustBadge with an explicit tier — kept for call sites not yet migrated. */
export function VerifiedBadge({ className }: { className?: string }) {
  return <TrustBadge tier="verified" className={className} />
}

export const TIER_DESCRIPTIONS: Record<TrustTier, string> = {
  verified: "Identité confirmée par l'équipe KONEXA (pièce d'identité + selfie de vérification).",
  verified_plus: "Identité, références et casier judiciaire vérifiés par l'équipe KONEXA.",
  premium: "Vérifié+ et plusieurs missions réussies avec d'excellentes évaluations.",
}
