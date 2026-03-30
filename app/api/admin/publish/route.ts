import { NextRequest, NextResponse } from "next/server"
import {
  getCurrentBranch,
  createAndCheckoutBranch,
  mergeBranches,
  pushToRemote,
  configureGit,
} from "@/lib/git-utils"
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
    await configureGit({
      name: "Admin Bot",
      email: "admin@active.vc",
    })

    const currentBranch = await getCurrentBranch()

    await createAndCheckoutBranch("main")

    await mergeBranches("staging", "main")

    await pushToRemote("main")

    if (currentBranch !== "main") {
      await createAndCheckoutBranch(currentBranch)
    }

    return NextResponse.json({
      success: true,
      message: "Staging changes published to production",
    })
  } catch (error) {
    console.error("Publish error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish failed" },
      { status: 500 }
    )
  }
}
