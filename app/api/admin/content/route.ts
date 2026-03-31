import { NextRequest, NextResponse } from "next/server"
import { getAllContent, updateContent, updateMultipleContent, SiteContent } from "@/lib/content"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, rateLimitConfigs.fileEdit)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    )
  }

  try {
    const content = await getAllContent()
    return NextResponse.json(content)
  } catch (error) {
    console.error("Admin content fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, rateLimitConfigs.fileEdit)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()

    // Single key update
    if (body.key && body.value !== undefined) {
      const validKeys: (keyof SiteContent)[] = [
        "hero_title",
        "hero_subtitle",
        "about_pat",
        "about_active_capital",
        "approach_items",
        "contact_html",
      ]

      if (!validKeys.includes(body.key)) {
        return NextResponse.json({ error: "Invalid content key" }, { status: 400 })
      }

      const result = await updateContent(body.key, body.value)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json({ success: true, key: body.key })
    }

    // Bulk update
    if (body.updates && typeof body.updates === "object") {
      const result = await updateMultipleContent(body.updates)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json({ success: true, keys: Object.keys(body.updates) })
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  } catch (error) {
    console.error("Admin content update error:", error)
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    )
  }
}
