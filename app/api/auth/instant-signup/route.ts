import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServiceClient } from "@/lib/supabase/service"

// Crée un compte utilisateur instantanément, sans code de vérification :
// choix explicite du produit pour l'inscription (voir discussion produit).
// Un compte existant n'est jamais réutilisé silencieusement ici — sinon
// n'importe qui pourrait se connecter à un compte tiers en devinant son
// email. La connexion des comptes existants reste soumise à vérification
// (voir /connexion).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const role = typeof body?.role === "string" ? body.role : ""
  const firstName = typeof body?.first_name === "string" ? body.first_name.trim() : ""
  const lastName = typeof body?.last_name === "string" ? body.last_name.trim() : ""
  const phone = typeof body?.phone === "string" ? body.phone.trim() : ""
  const companyName = typeof body?.company_name === "string" ? body.company_name.trim() : undefined

  if (!email || !role || !firstName || !lastName) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      role,
      first_name: firstName,
      last_name: lastName,
      phone,
      ...(companyName ? { company_name: companyName } : {}),
    },
  })

  if (createError || !created.user) {
    const alreadyExists = createError?.message?.toLowerCase().includes("already") ?? false
    return NextResponse.json(
      {
        error: alreadyExists
          ? "Un compte existe déjà avec cet email. Connectez-vous plutôt."
          : "Impossible de créer le compte. Réessayez dans un instant.",
      },
      { status: alreadyExists ? 409 : 500 }
    )
  }

  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: "magiclink",
    email,
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    return NextResponse.json(
      { error: "Compte créé mais connexion automatique impossible. Connectez-vous depuis /connexion." },
      { status: 500 }
    )
  }

  const anon = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: verified, error: verifyError } = await anon.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token,
  })

  if (verifyError || !verified.session) {
    return NextResponse.json(
      { error: "Compte créé mais connexion automatique impossible. Connectez-vous depuis /connexion." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
    user_id: verified.user?.id ?? created.user.id,
  })
}
