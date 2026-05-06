import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

// Auth-aware SSR client: production DB in production, staging otherwise
export async function createServerSupabase() {
  const cookieStore = await cookies()

  const isProd = process.env.VERCEL_ENV === "production"
  const url = isProd
    ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_URL!
    : process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = isProd
    ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_ANON_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Partial<ResponseCookie> }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
