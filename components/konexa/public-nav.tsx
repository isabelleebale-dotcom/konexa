import Link from "next/link"

export function PublicNav() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
          KONEXA
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/agents" className="text-foreground/80 hover:text-foreground">
            Trouver un agent
          </Link>
          <Link
            href="/comment-ca-marche"
            className="text-foreground/80 hover:text-foreground"
          >
            Comment ça marche
          </Link>
          <Link href="/#avis" className="text-foreground/80 hover:text-foreground">
            Avis
          </Link>
          <Link
            href="/inscription"
            className="text-foreground/80 hover:text-foreground"
          >
            Devenir client
          </Link>
          <Link
            href="/devenir-agent"
            className="text-foreground/80 hover:text-foreground"
          >
            Devenir agent
          </Link>
        </nav>
      </div>
    </header>
  )
}
