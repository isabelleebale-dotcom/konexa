import { createBrowserClient } from "@supabase/ssr"

// Untyped until lib/supabase/database.types.ts is generated from the real
// project — see lib/supabase/types.ts for the plan.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
