import { NextRequest, NextResponse } from "next/server"
import { mergeBranches } from "@/lib/github-api"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"
import { publishStagingToProduction, saveContentVersion } from "@/lib/content"

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, rateLimitConfigs.publish)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many publish requests. Please wait before trying again." },
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
    const action = body.action || "both" // "db", "git", or "both"

    const results: Record<string, any> = {}

    // DB Update
    if (action === "db" || action === "both") {
      const dbResult = await publishStagingToProduction()
      if (!dbResult.success) {
        return NextResponse.json(
          { error: `Database publish failed: ${dbResult.error}` },
          { status: 500 }
        )
      }

      const versionResult = await saveContentVersion(dbResult.snapshot!)
      if (!versionResult.success) {
        console.error("Version save failed:", versionResult.error)
      }

      results.db = {
        success: true,
        version: versionResult.version,
        message: `Database updated to version ${versionResult.version}`,
      }
    }

    // Git Merge
    if (action === "git" || action === "both") {
      const gitResult = await mergeBranches("staging", "main")
      results.git = {
        success: true,
        message: gitResult.message + ". Vercel will auto-deploy to production.",
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message:
        action === "both"
          ? `Database updated${results.db?.version ? ` to v${results.db.version}` : ""}. ${results.git?.message}`
          : action === "db"
            ? results.db?.message
            : results.git?.message,
    })
  } catch (error) {
    console.error("Publish error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish failed" },
      { status: 500 }
    )
  }
}
