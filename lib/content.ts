import { getSupabase, getProductionSupabase } from "./supabase"

export interface ApproachItem {
  label: string
  icon: string
}

export interface SiteContent {
  hero_title: string
  hero_subtitle: string
  about_pat: string
  about_active_capital: string
  approach_items: ApproachItem[]
  contact_html: string
}

export interface ContentVersion {
  id: string
  version: string
  major: number
  minor: number
  patch: number
  snapshot: Array<{ key: string; value: any }>
  published_at: string
}

export const DEFAULT_CONTENT: SiteContent = {
  hero_title: "Founder Led Capital for Founder Led Companies",
  hero_subtitle: "Pre-Seed Investing in AI-Native Business Software",
  about_pat:
    "Hi, I'm Pat. I'm an entrepreneur turned investor. I've spent my career starting, scaling, and investing in startups. I started Active Capital because I love backing technical founders and helping them reach their potential. I've spent more than 20 years building and investing in software, cloud infrastructure, and AI, and I believe the future is brighter than ever. If you're a founder building an AI-native company, I'd love to hear from you. I welcome warm intros and cold emails.",
  about_active_capital:
    "Active Capital is a venture firm focused on pre-seed investing in technical founders building AI-native software, infrastructure, and products that solve real business problems. We love working with founders who stay small and scrappy until they find true product-market fit. We typically invest $100K to $1M, with the ability to invest significantly more as companies grow and our relationship develops. We like to invest early and be a meaningful part of the first capital raised.",
  approach_items: [
    { label: "Pre-Seed Investing", icon: "/img/icons/how_we_invest/Pre-Seed Investing.svg" },
    { label: "Business Software", icon: "/img/icons/how_we_invest/AI-Native Software.svg" },
    { label: "$100k - $1M Checks", icon: "/img/icons/how_we_invest/100k-1M Checks.svg" },
    { label: "Technical Founders", icon: "/img/icons/how_we_invest/Technical Founders.svg" },
    { label: "Apps, Agents, Infra", icon: "/img/icons/how_we_invest/B2B, Infra, Dev Tools.png" },
    { label: "Building in the US", icon: "/img/icons/how_we_invest/Buildin in the US.svg" },
  ],
  contact_html:
    '<p>If you\'re a founder building AI-native business software, please email: team@active.vc</p>',
}

function rowsToContent(rows: Array<{ key: string; value: any }>): SiteContent {
  const map: Record<string, any> = {}
  for (const row of rows) map[row.key] = row.value
  return {
    hero_title: map.hero_title ?? DEFAULT_CONTENT.hero_title,
    hero_subtitle: map.hero_subtitle ?? DEFAULT_CONTENT.hero_subtitle,
    about_pat: map.about_pat ?? DEFAULT_CONTENT.about_pat,
    about_active_capital: map.about_active_capital ?? DEFAULT_CONTENT.about_active_capital,
    approach_items: map.approach_items ?? DEFAULT_CONTENT.approach_items,
    contact_html: map.contact_html ?? DEFAULT_CONTENT.contact_html,
  }
}

// Reads from site_content — staging DB on staging/local, production DB on production Vercel
export async function getAllContent(): Promise<SiteContent> {
  try {
    const supabase = getSupabase()
    if (!supabase) return DEFAULT_CONTENT

    const { data, error } = await supabase.from("site_content").select("key, value")

    if (error || !data || data.length === 0) return DEFAULT_CONTENT
    return rowsToContent(data)
  } catch (err) {
    console.error("Failed to fetch content:", err)
    return DEFAULT_CONTENT
  }
}

export async function updateContent(
  key: keyof SiteContent,
  value: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: "Supabase not configured" }

    const { error } = await supabase
      .from("site_content")
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      )

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function updateMultipleContent(
  updates: Partial<SiteContent>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: "Supabase not configured" }

    const rows = Object.entries(updates).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from("site_content")
      .upsert(rows, { onConflict: "key" })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

// Copies staging site_content → production site_content and returns the snapshot
export async function publishStagingToProduction(): Promise<{
  success: boolean
  snapshot?: Array<{ key: string; value: any }>
  error?: string
}> {
  try {
    const stagingSupabase = getSupabase()
    if (!stagingSupabase) return { success: false, error: "Staging Supabase not configured" }

    const productionSupabase = getProductionSupabase()
    if (!productionSupabase) return { success: false, error: "Production Supabase not configured (PRODUCTION_SUPABASE_URL / PRODUCTION_SUPABASE_SERVICE_ROLE_KEY missing)" }

    const { data: stagingRows, error: fetchError } = await stagingSupabase
      .from("site_content")
      .select("key, value")

    if (fetchError) return { success: false, error: fetchError.message }
    if (!stagingRows || stagingRows.length === 0) {
      return { success: false, error: "No staging content found" }
    }

    const productionRows = stagingRows.map((row) => ({
      ...row,
      updated_at: new Date().toISOString(),
    }))

    const { error: upsertError } = await productionSupabase
      .from("site_content")
      .upsert(productionRows, { onConflict: "key" })

    if (upsertError) return { success: false, error: upsertError.message }

    return { success: true, snapshot: stagingRows }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

// Returns the next semver string and saves a version record; keeps last 10 versions
export async function saveContentVersion(
  snapshot: Array<{ key: string; value: any }>
): Promise<{ success: boolean; version?: string; error?: string }> {
  try {
    const supabase = getSupabase()
    if (!supabase) return { success: false, error: "Supabase not configured" }

    const { data: latest } = await supabase
      .from("content_versions")
      .select("major, minor, patch")
      .order("published_at", { ascending: false })
      .limit(1)
      .single()

    let major = 1, minor = 0, patch = 0
    if (latest) {
      major = latest.major
      minor = latest.minor
      patch = latest.patch + 1
    }

    const version = `${major}.${minor}.${patch}`

    const { error: insertError } = await supabase.from("content_versions").insert({
      version,
      major,
      minor,
      patch,
      snapshot,
    })

    if (insertError) return { success: false, error: insertError.message }

    // Prune versions beyond the most recent 10
    const { data: allVersions } = await supabase
      .from("content_versions")
      .select("id")
      .order("published_at", { ascending: false })

    if (allVersions && allVersions.length > 10) {
      const toDelete = allVersions.slice(10).map((v) => v.id)
      await supabase.from("content_versions").delete().in("id", toDelete)
    }

    return { success: true, version }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

// Returns the last 10 published versions (newest first)
export async function getContentVersions(): Promise<ContentVersion[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from("content_versions")
      .select("id, version, major, minor, patch, snapshot, published_at")
      .order("published_at", { ascending: false })
      .limit(10)

    if (error || !data) return []
    return data as ContentVersion[]
  } catch {
    return []
  }
}

// Restores production site_content to a specific version snapshot
export async function revertToVersion(
  id: string
): Promise<{ success: boolean; version?: string; error?: string }> {
  try {
    const stagingSupabase = getSupabase()
    if (!stagingSupabase) return { success: false, error: "Supabase not configured" }

    const productionSupabase = getProductionSupabase()
    if (!productionSupabase) return { success: false, error: "Production Supabase not configured" }

    const { data: versionRecord, error: fetchError } = await stagingSupabase
      .from("content_versions")
      .select("version, snapshot")
      .eq("id", id)
      .single()

    if (fetchError || !versionRecord) {
      return { success: false, error: "Version not found" }
    }

    const rows = (versionRecord.snapshot as Array<{ key: string; value: any }>).map((row) => ({
      ...row,
      updated_at: new Date().toISOString(),
    }))

    const { error: upsertError } = await productionSupabase
      .from("site_content")
      .upsert(rows, { onConflict: "key" })

    if (upsertError) return { success: false, error: upsertError.message }

    return { success: true, version: versionRecord.version }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
