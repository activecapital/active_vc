import { NextRequest, NextResponse } from "next/server"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"
import { getSupabase } from "@/lib/supabase"

// POST { type: "email", email: string }
//   or { type: "phone", phone: string }   (E.164 format: "+12184602308")
export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, rateLimitConfigs.auth)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
        },
      }
    )
  }

  try {
    const body = await request.json()
    const { type, email, phone } = body

    if (type !== "email" && type !== "phone") {
      return NextResponse.json({ error: "Invalid login type" }, { status: 400 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    // Check against admin_users whitelist
    let isAuthorized = false

    if (type === "email" && email) {
      const normalized = email.toLowerCase().trim()
      const { data: byPrimary } = await supabase
        .from("admin_users")
        .select("id")
        .eq("primary_email", normalized)
        .maybeSingle()
      if (byPrimary) {
        isAuthorized = true
      } else {
        const { data: bySecondary } = await supabase
          .from("admin_users")
          .select("id")
          .eq("secondary_email", normalized)
          .maybeSingle()
        isAuthorized = !!bySecondary
      }
    } else if (type === "phone" && phone) {
      const rows = await supabase.from("admin_users").select("primary_phone_country_code, primary_phone_number, secondary_phone_country_code, secondary_phone_number")
      isAuthorized = !!(rows.data?.some(
        (r) =>
          `${r.primary_phone_country_code}${r.primary_phone_number}` === phone ||
          `${r.secondary_phone_country_code}${r.secondary_phone_number}` === phone
      ))
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Whitelist confirmed — browser will call signInWithOtp directly (PKCE flow)
    return NextResponse.json({ authorized: true, type })
  } catch (error: any) {
    console.error("Auth error:", error)
    return NextResponse.json(
      { error: error?.message ?? "Authentication failed" },
      { status: 500 }
    )
  }
}
