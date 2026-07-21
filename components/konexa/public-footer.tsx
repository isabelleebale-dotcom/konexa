import Link from "next/link"

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-heading text-lg font-semibold">KONEXA</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Personnel domestique et d&rsquo;entretien vérifié à Douala.
              La confiance rendue visible.
            </p>
          </div>

          <div className="text-sm">
            <p className="font-medium text-foreground">Plateforme</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/agents" className="hover:text-foreground">
                  Trouver un agent
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="hover:text-foreground">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/devenir-agent" className="hover:text-foreground">
                  Devenir agent KONEXA
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <p className="font-medium text-foreground">Contact</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>Douala, Cameroun</li>
              <li>Paiement MTN MoMo &amp; Orange Money</li>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} KONEXA. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
