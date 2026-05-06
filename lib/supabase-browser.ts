import { createBrowserClient } from "@supabase/ssr"

// Auth-aware browser client: production DB in production, staging otherwise
export function createBrowserSupabase() {
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === "production"

  const url = isProd
    ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_URL!
    : process.env.NEXT_PUBLIC_STAGING_SUPABASE_URL!
  const anonKey = isProd
    ? process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_ANON_KEY!
    : process.env.NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY!

  return createBrowserClient(url, anonKey)
}
