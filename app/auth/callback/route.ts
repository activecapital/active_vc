import { createServerSupabase } from "@/lib/supabase-server"
import { getAuthSupabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Google OAuth lets anyone with a Google account complete sign-in, so the
// admin_users whitelist must be enforced here, after the code exchange.
async function isWhitelisted(email: string): Promise<boolean> {
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

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/admin"

  if (code) {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const email = data.session?.user.email
      if (email && (await isWhitelisted(email))) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/admin?error=not_authorized`)
    }
  }

  return NextResponse.redirect(`${origin}/admin?error=auth_failed`)
}
