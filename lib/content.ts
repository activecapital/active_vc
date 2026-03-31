import { getSupabase } from "./supabase"

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

export async function getAllContent(): Promise<SiteContent> {
  try {
    const supabase = getSupabase()
    if (!supabase) return DEFAULT_CONTENT

    const { data, error } = await supabase
      .from("site_content")
      .select("key, value")

    if (error || !data || data.length === 0) {
      return DEFAULT_CONTENT
    }

    const content: Record<string, any> = {}
    for (const row of data) {
      content[row.key] = row.value
    }

    return {
      hero_title: content.hero_title ?? DEFAULT_CONTENT.hero_title,
      hero_subtitle: content.hero_subtitle ?? DEFAULT_CONTENT.hero_subtitle,
      about_pat: content.about_pat ?? DEFAULT_CONTENT.about_pat,
      about_active_capital: content.about_active_capital ?? DEFAULT_CONTENT.about_active_capital,
      approach_items: content.approach_items ?? DEFAULT_CONTENT.approach_items,
      contact_html: content.contact_html ?? DEFAULT_CONTENT.contact_html,
    }
  } catch (err) {
    console.error("Failed to fetch content from Supabase:", err)
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

    if (error) {
      return { success: false, error: error.message }
    }

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

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
