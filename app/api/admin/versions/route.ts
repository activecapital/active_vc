import { NextRequest, NextResponse } from "next/server"
import { getContentVersions, revertToVersion } from "@/lib/content"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if ("response" in admin) return admin.response

  const rateLimitResult = await rateLimit(request, rateLimitConfigs.fileEdit, "versions")
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  }

  try {
    const versions = await getContentVersions()
    return NextResponse.json({ versions })
  } catch (error) {
    console.error("Versions fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if ("response" in admin) return admin.response

  const rateLimitResult = await rateLimit(request, rateLimitConfigs.publish, "versions-publish")
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
  }

  try {
    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ error: "Version id required" }, { status: 400 })
    }

    const result = await revertToVersion(body.id)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Reverted production to version ${result.version}.`,
      version: result.version,
    })
  } catch (error) {
    console.error("Revert error:", error)
    return NextResponse.json({ error: "Failed to revert" }, { status: 500 })
  }
}
