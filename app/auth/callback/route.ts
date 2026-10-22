import { createServerSupabase } from "@/lib/supabase-server"
import { isWhitelisted } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Google OAuth lets anyone with a Google account complete sign-in, so the
// admin_users whitelist must be enforced here, after the code exchange.
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
