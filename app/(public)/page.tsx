import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrustBadge } from "@/components/konexa/verified-badge"
import { AgentCard } from "@/components/konexa/agent-card"
import { ServiceCategoryLinks } from "@/components/konexa/service-category-links"
import { HeroVisual } from "@/components/konexa/hero-visual"
import { Reveal } from "@/components/konexa/reveal"
import { demoReviews } from "@/lib/demo-data"
import { getPublicAgents } from "@/lib/queries/agents"
import { cn } from "@/lib/utils"

const STEPS = [
  { number: "01", title: "Choisissez", text: "Ménagère, nounou ou agent d'entretien — un clic depuis l'accueil." },
  { number: "02", title: "Réservez", text: "Un agent précis, ou une demande sur mesure sous 48h." },
  { number: "03", title: "Payez", text: "MTN MoMo ou Orange Money, reçu digital immédiat." },
  { number: "04", title: "Suivez", text: "Avis, signalement, garantie de remplacement 30 jours." },
]

const REGIONS = [
  { name: "Littoral", active: true },
  { name: "Centre", active: false },
  { name: "Ouest", active: false },
  { name: "Nord-Ouest", active: false },
  { name: "Sud-Ouest", active: false },
  { name: "Adamaoua", active: false },
  { name: "Est", active: false },
  { name: "Extrême-Nord", active: false },
  { name: "Nord", active: false },
  { name: "Sud", active: false },
]

export default async function HomePage() {
  const agents = await getPublicAgents()
  const featuredAgents = agents.slice(0, 3)

  return (
    <div>
      {/* Hero — nuance la plus profonde */}
      <section className="relative overflow-hidden bg-[#0F172A]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(160deg, #0F172A 0%, #131c33 55%, #0F172A 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "#7C3AED" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 top-1/3 size-80 rounded-full opacity-[0.15] blur-3xl"
          style={{ backgroundColor: "#3B82F6" }}
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-wide text-[#C4B5FD]">
              Douala
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Ménagères, nounous et agents d&rsquo;entretien{" "}
              <em className="not-italic text-[#A78BFA]">vérifiés</em>, dans
              votre quartier.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              KONEXA vérifie personnellement chaque agent — pour les
              familles comme pour les bureaux, cliniques et commerces — et
              vous connecte avec ceux qui interviennent près de chez vous à
              Douala.
            </p>

            <div className="mt-10">
              <p className="text-sm font-medium text-white/70">
                Je cherche du personnel de confiance pour&hellip;
              </p>
              <div className="mt-3">
                <ServiceCategoryLinks dark />
              </div>
              <p className="mt-5 text-sm text-white/60">
                Vous cherchez un emploi plutôt qu&rsquo;un agent ?{" "}
                <Link href="/devenir-agent" className="font-medium text-[#C4B5FD] hover:text-[#A78BFA]">
                  Postulez ici
                </Link>
                .
              </p>
            </div>
          </Reveal>

          <Reveal delay={150} className="hidden lg:block">
            <HeroVisual dark />
          </Reveal>
        </div>
      </section>

      {/* Comment ça marche — nuance intermédiaire */}
      <section className="border-b border-white/5 bg-[#0D1526]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Reveal>
            <div className="flex items-end justify-between">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Comment ça marche
              </h2>
              <Link href="/comment-ca-marche" className="text-sm font-medium text-primary hover:text-[#A78BFA]">
                En détail →
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.number}>
                  <p className="font-heading text-xl font-semibold text-primary">{step.number}</p>
                  <p className="mt-1 font-medium">{step.title}</p>
                  <p className="mt-1 text-sm text-foreground/70">{step.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Ce qui nous distingue — nuance de base */}
      <section className="border-b border-white/5 bg-[#0B1120]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal className="grid gap-10 sm:grid-cols-3">
            <div>
              <div className="flex flex-wrap gap-1.5">
                <TrustBadge tier="verified" />
                <TrustBadge tier="verified_plus" />
                <TrustBadge tier="premium" />
              </div>
              <p className="mt-3 font-heading text-lg font-semibold">
                Vérifié en personne
              </p>
              <p className="mt-1.5 text-sm text-foreground/75">
                Pièce d&rsquo;identité, selfie de vérification, références et
                casier judiciaire contrôlés par l&rsquo;équipe KONEXA avant
                qu&rsquo;un agent n&rsquo;apparaisse sur la plateforme.
              </p>
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">
                Avis réels, publics
              </p>
              <p className="mt-1.5 text-sm text-foreground/75">
                Chaque placement se conclut par un avis client visible sur le
                profil de l&rsquo;agent — pas de note truquée.
              </p>
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">
                Paiement mobile money
              </p>
              <p className="mt-1.5 text-sm text-foreground/75">
                MTN MoMo et Orange Money, avec reçu digital. Fini le cash sans
                preuve.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Agents en avant — nuance intermédiaire, légèrement plus claire */}
      <section className="bg-[#101A2E]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal>
            <div className="flex items-end justify-between">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Agents disponibles
              </h2>
              <Link href="/agents" className="text-sm font-medium text-primary hover:text-[#A78BFA]">
                Voir tout le catalogue →
              </Link>
            </div>
            {featuredAgents.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Les premiers agents sont en cours de vérification — revenez très bientôt.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}

            <div className="mt-10 border-t border-white/5 pt-8">
              <p className="text-sm font-medium text-foreground/70">
                Régions du Cameroun
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {REGIONS.map((region) => (
                  <span
                    key={region.name}
                    className={cn(
                      "rounded-sm border px-3 py-1.5 text-sm",
                      region.active
                        ? "border-verified/40 bg-verified/10 text-verified"
                        : "border-white/10 bg-white/5 text-muted-foreground"
                    )}
                  >
                    {region.name}
                    {!region.active && <span className="ml-1.5 text-xs opacity-70">Bientôt</span>}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                KONEXA vérifie ses agents en personne, région par région —
                actif à Douala (Littoral), en cours d&rsquo;extension ailleurs
                au Cameroun.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Témoignages */}
      <section id="avis" className="scroll-mt-16 border-t border-white/5 bg-[#0D1526]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Ce que disent les familles
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {demoReviews.slice(0, 2).map((review) => (
                <blockquote key={review.id} className="rounded-md border border-border bg-card p-5">
                  <p className="text-foreground/85">&ldquo;{review.comment}&rdquo;</p>
                  <footer className="mt-3 text-sm text-muted-foreground">
                    {review.client_first_name} — {review.rating}/5
                  </footer>
                </blockquote>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#0B1120] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="rounded-md border border-white/10 bg-card p-8 text-center shadow-[0_0_40px_-12px_rgba(124,58,237,0.25)] sm:p-12">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Trouvez la personne de confiance qu&rsquo;il vous faut, aujourd&rsquo;hui.
              </h2>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" render={<Link href="/agents">Parcourir le catalogue</Link>} />
                <Button
                  size="lg"
                  variant="outline"
                  render={<Link href="/comment-ca-marche">Comment ça marche</Link>}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
