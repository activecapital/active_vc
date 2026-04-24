import { NextRequest, NextResponse } from "next/server"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"
import { createServerSupabase } from "@/lib/supabase-server"

// POST { phone: string, token: string }
// Verifies a phone SMS OTP and sets the session cookie
export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, rateLimitConfigs.auth)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const { phone, token } = await request.json()

    if (!phone || !token) {
      return NextResponse.json({ error: "Phone and token are required" }, { status: 400 })
    }

    const supabase = await createServerSupabase()
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.session) {
      return NextResponse.json({ error: "Verification failed" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Verify error:", error)
    return NextResponse.json(
      { error: error?.message ?? "Verification failed" },
      { status: 500 }
    )
  }
}
