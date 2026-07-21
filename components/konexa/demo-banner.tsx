export function DemoBanner() {
  return (
    <div className="border-b border-primary/20 bg-primary/5 px-4 py-2 text-center text-xs text-primary sm:px-6">
      Mode démonstration — données fictives, non persistées. Connectez le
      projet Supabase (voir .env.local) pour activer les comptes réels.
    </div>
  )
}
