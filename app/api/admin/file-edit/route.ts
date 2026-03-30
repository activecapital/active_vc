import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, rateLimitConfigs.fileEdit)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many file operations. Please slow down." },
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
    const { filepath, content, operation } = await request.json()

    if (!filepath) {
      return NextResponse.json({ error: "Filepath required" }, { status: 400 })
    }

    const fullPath = path.join(process.cwd(), filepath)

    if (!fullPath.startsWith(process.cwd())) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 })
    }

    if (operation === "read") {
      try {
        const fileContent = await fs.readFile(fullPath, "utf-8")
        return NextResponse.json({ content: fileContent })
      } catch (error) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }
    } else if (operation === "write") {
      if (!content) {
        return NextResponse.json({ error: "Content required" }, { status: 400 })
      }

      const dir = path.dirname(fullPath)
      await fs.mkdir(dir, { recursive: true })

      await fs.writeFile(fullPath, content, "utf-8")

      return NextResponse.json({
        success: true,
        message: "File updated successfully",
        filepath,
      })
    } else {
      return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
    }
  } catch (error) {
    console.error("File edit error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "File operation failed" },
      { status: 500 }
    )
  }
}
