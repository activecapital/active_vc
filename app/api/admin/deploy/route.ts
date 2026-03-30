import { NextRequest, NextResponse } from "next/server"
import {
  getCurrentBranch,
  createAndCheckoutBranch,
  commitChanges,
  pushToRemote,
  configureGit,
  hasUncommittedChanges,
} from "@/lib/git-utils"
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
    const { files, message, target } = await request.json()

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files specified" }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: "Commit message required" }, { status: 400 })
    }

    await configureGit({
      name: "Admin Bot",
      email: "admin@active.vc",
    })

    const currentBranch = await getCurrentBranch()

    if (target === "staging") {
      if (currentBranch !== "staging") {
        await createAndCheckoutBranch("staging")
      }

      const hasChanges = await hasUncommittedChanges()
      if (!hasChanges && files.length === 0) {
        return NextResponse.json(
          { error: "No changes to commit" },
          { status: 400 }
        )
      }

      await commitChanges(message, files)
      await pushToRemote("staging")

      return NextResponse.json({
        success: true,
        branch: "staging",
        message: "Changes deployed to staging",
      })
    } else if (target === "production") {
      if (currentBranch !== "main") {
        await createAndCheckoutBranch("main")
      }

      await commitChanges(message, files)
      await pushToRemote("main")

      return NextResponse.json({
        success: true,
        branch: "main",
        message: "Changes deployed to production",
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
