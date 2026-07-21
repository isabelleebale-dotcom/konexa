"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const DASHBOARD_PATH: Record<string, string> = {
  famille: "/famille/tableau-de-bord",
  entreprise: "/entreprise/tableau-de-bord",
  agent: "/agent/espace",
  admin: "/admin/tableau-de-bord",
}

export function EmailOtpForm({ next }: { next?: string }) {
  const router = useRouter()

  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendCode(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    // shouldCreateUser: false — la connexion ne doit jamais créer de compte,
    // seule l'inscription (instantanée, sans code) le fait.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    setLoading(false)
    if (error) {
      setError(
        "Aucun compte trouvé avec cet email, ou envoi du code impossible. Réessayez dans un instant."
      )
      return
    }
    setStep("code")
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    })

    setLoading(false)
    if (error || !data.user) {
      setError("Code incorrect ou expiré.")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    const role = (profile as { role?: string } | null)?.role
    router.push(next ?? (role ? DASHBOARD_PATH[role] : "/"))
    router.refresh()
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Envoi…" : "Recevoir le code"}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={verifyCode} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="code">Code reçu par email</Label>
        <Input
          id="code"
          inputMode="numeric"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Vérification…" : "Confirmer"}
      </Button>
      <button
        type="button"
        onClick={() => setStep("email")}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Changer d&rsquo;email
      </button>
    </form>
  )
}
