import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

type Role = "famille" | "entreprise" | "agent" | "admin"

const ROLE_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/famille", role: "famille" },
  { prefix: "/entreprise", role: "entreprise" },
  { prefix: "/agent/espace", role: "agent" },
  { prefix: "/admin", role: "admin" },
]

const DASHBOARD_PATH: Record<Role, string> = {
  famille: "/famille/tableau-de-bord",
  entreprise: "/entreprise/tableau-de-bord",
  agent: "/agent/espace",
  admin: "/admin/tableau-de-bord",
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  // No Supabase project configured yet (see .env.local.example) — let public
  // pages render; role-gated routes simply aren't reachable until it's set up.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const requiredRole = ROLE_PREFIXES.find(({ prefix }) =>
    request.nextUrl.pathname.startsWith(prefix)
  )?.role

  if (!requiredRole) {
    return response
  }

  if (!user) {
    const redirectUrl = new URL("/connexion", request.url)
    redirectUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const userRole = profile?.role as Role | undefined

  if (userRole !== requiredRole) {
    const fallback = userRole ? DASHBOARD_PATH[userRole] : "/connexion"
    return NextResponse.redirect(new URL(fallback, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
}
