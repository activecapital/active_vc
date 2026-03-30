import { NextRequest, NextResponse } from "next/server"
import { ensureBranchExists } from "@/lib/github-api"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, rateLimitConfigs.deploy)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many deployment requests. Please wait before trying again." },
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
    const { target } = await request.json()

    if (target === "staging") {
      await ensureBranchExists("staging")
      return NextResponse.json({
        success: true,
        branch: "staging",
        message: "Staging branch ready. Files are committed directly via GitHub API.",
      })
    } else if (target === "production") {
      return NextResponse.json({
        success: true,
        branch: "main",
        message: "Use the Publish button to merge staging into production.",
      })
    } else {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 })
    }
  } catch (error) {
    console.error("Deploy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deployment failed" },
      { status: 500 }
    )
  }
}
