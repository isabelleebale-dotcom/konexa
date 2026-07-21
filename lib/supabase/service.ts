import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role client — bypasses RLS. Server-only, never import from a
 * Client Component. Used for: PDF receipt/invoice writes, admin RPCs that
 * need elevated access, and webhook handlers acting on behalf of the system.
 * Untyped until lib/supabase/database.types.ts is generated — see
 * lib/supabase/types.ts for the plan.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
