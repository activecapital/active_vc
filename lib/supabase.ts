import { createClient, SupabaseClient } from "@supabase/supabase-js"

let _supabase: SupabaseClient | null = null
let _productionSupabase: SupabaseClient | null = null

// Returns true when running on the Vercel production deployment (main branch)
export function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production"
}

// Staging Supabase client (used by admin editor, chat, versions — always staging)
export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_STAGING_SUPABASE_URL
  const supabaseServiceKey = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) return null

  _supabase = createClient(supabaseUrl, supabaseServiceKey)
  return _supabase
}

// Production Supabase client (used for publishing and version history)
export function getProductionSupabase(): SupabaseClient | null {
  if (_productionSupabase) return _productionSupabase

  const supabaseUrl = process.env.NEXT_PUBLIC_PRODUCTION_SUPABASE_URL
  const supabaseServiceKey = process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) return null

  _productionSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _productionSupabase
}

// Public-facing reads: production DB in production, staging DB otherwise
export function getPublicSupabase(): SupabaseClient | null {
  return isProduction() ? getProductionSupabase() : getSupabase()
}

// Auth whitelist checks: production DB in production, staging DB otherwise
export function getAuthSupabase(): SupabaseClient | null {
  return isProduction() ? getProductionSupabase() : getSupabase()
}
