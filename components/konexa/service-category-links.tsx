"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Home, Baby, Building2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  {
    service: "menagere",
    label: "Ménagère",
    description: "Entretien du foyer, repassage, cuisine — temps plein ou partiel.",
    icon: Home,
    photos: [
      "https://images.pexels.com/photos/6197050/pexels-photo-6197050.jpeg?w=800",
      "https://images.pexels.com/photos/6197043/pexels-photo-6197043.jpeg?w=800",
      "https://images.pexels.com/photos/6197046/pexels-photo-6197046.jpeg?w=800",
    ],
  },
  {
    service: "nounou",
    label: "Nounou",
    description: "Garde d'enfants, premiers secours pédiatriques, disponibilité flexible.",
    icon: Baby,
    photos: [
      "https://images.unsplash.com/photo-1591451855781-9eb0f9726a33?w=800&q=80",
      "https://images.pexels.com/photos/19995337/pexels-photo-19995337.jpeg?w=800",
      "https://images.pexels.com/photos/11770053/pexels-photo-11770053.jpeg?w=800",
    ],
  },
  {
    service: "agent_entretien",
    label: "Agent d'entretien",
    description: "Bureaux, cliniques, commerces — normes d'hygiène respectées.",
    icon: Building2,
    photos: [
      "https://images.pexels.com/photos/6197114/pexels-photo-6197114.jpeg?w=800",
      "https://images.pexels.com/photos/6196695/pexels-photo-6196695.jpeg?w=800",
      "https://images.pexels.com/photos/7641546/pexels-photo-7641546.jpeg?w=800",
    ],
  },
] as const

const ROTATE_MS = 3500

function CategoryPhotoSlideshow({ photos, label }: { photos: readonly string[]; label: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [photos.length])

  return (
    <>
      {photos.map((photo, i) => (
        <Image
          key={photo}
          src={photo}
          alt={label}
          fill
          unoptimized
          sizes="(min-width: 640px) 33vw, 100vw"
          className={cn(
            "absolute inset-0 object-cover transition-opacity duration-1000 ease-in-out group-hover:scale-105",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
    </>
  )
}

export function ServiceCategoryLinks({ dark }: { dark?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        return (
          <Link
            key={cat.service}
            href={`/agents?service=${cat.service}`}
            className={cn(
              "group overflow-hidden rounded-md border transition-all duration-200",
              dark
                ? "border-white/15 bg-white/10 backdrop-blur-md hover:-translate-y-0.5 hover:border-[#7C3AED]/60 hover:shadow-lg hover:shadow-[#7C3AED]/20"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <CategoryPhotoSlideshow photos={cat.photos} label={cat.label} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="pointer-events-none absolute left-3 top-3 flex size-9 items-center justify-center rounded-sm bg-[#7C3AED]/80 text-white backdrop-blur-sm">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <p className="pointer-events-none absolute bottom-3 left-3 font-heading text-lg font-semibold text-white">
                {cat.label}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 p-4">
              <p className={cn("text-sm", dark ? "text-white/65" : "text-foreground/70")}>
                {cat.description}
              </p>
              <ArrowRight
                className={cn(
                  "size-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                  dark ? "text-white/50 group-hover:text-[#C4B5FD]" : "text-muted-foreground group-hover:text-primary"
                )}
              />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
