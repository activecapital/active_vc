import { NextRequest, NextResponse } from "next/server"
import { mergeBranches } from "@/lib/github-api"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"

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
    const result = await mergeBranches("staging", "main")

    return NextResponse.json({
      success: true,
      message: result.message + ". Vercel will auto-deploy to production.",
    })
  } catch (error) {
    console.error("Publish error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish failed" },
      { status: 500 }
    )
  }
}
