import { NextResponse } from "next/server"
import { createServerSupabase } from "./supabase-server"
import { getAuthSupabase } from "./supabase"

// Returns true when the given email belongs to an admin_users whitelist row
// (matching primary or secondary email). Uses the service-role client so the
// read is not blocked by RLS.
export async function isWhitelisted(email: string): Promise<boolean> {
  const supabase = getAuthSupabase()
  if (!supabase) return false

  const normalized = email.toLowerCase().trim()
  const { data: byPrimary } = await supabase
    .from("admin_users")
    .select("id")
    .eq("primary_email", normalized)
    .maybeSingle()
  if (byPrimary) return true

  const { data: bySecondary } = await supabase
    .from("admin_users")
    .select("id")
    .eq("secondary_email", normalized)
    .maybeSingle()
  return !!bySecondary
}

// Returns the whitelisted admin's email when the request carries a valid
// authenticated session for an authorized account, otherwise null. Every
// /api/admin/* route must call this before doing any work.
export async function getAdminEmail(): Promise<string | null> {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email
    if (!email) return null
    return (await isWhitelisted(email)) ? email.toLowerCase().trim() : null
  } catch {
    return null
  }
}

// Convenience guard for route handlers: returns the admin email, or a 401
// NextResponse the caller can return directly.
export async function requireAdmin(): Promise<
  { email: string } | { response: ReturnType<typeof NextResponse.json> }
> {
  const email = await getAdminEmail()
  if (!email) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { email }
}
