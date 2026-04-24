import { createClient, SupabaseClient } from "@supabase/supabase-js"

let _supabase: SupabaseClient | null = null
let _productionSupabase: SupabaseClient | null = null

// Staging Supabase client (used by admin editor, staging reads)
export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) return null

  _supabase = createClient(supabaseUrl, supabaseServiceKey)
  return _supabase
}

// Production Supabase client (used for publishing and version history)
export function getProductionSupabase(): SupabaseClient | null {
  if (_productionSupabase) return _productionSupabase

  const supabaseUrl = process.env.PRODUCTION_SUPABASE_URL
  const supabaseServiceKey = process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) return null

  _productionSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _productionSupabase
}
