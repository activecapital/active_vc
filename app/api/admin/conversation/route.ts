import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

function getTodayFilename(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}.md`
}

function parseMarkdownConversation(markdown: string): Message[] {
  const messages: Message[] = []
  const lines = markdown.split("\n")

  let currentMessage: Partial<Message> | null = null

  for (const line of lines) {
    const messageMatch = line.match(/^## (.+?) - (User|Assistant|System)$/)
    if (messageMatch) {
      if (currentMessage && currentMessage.content) {
        messages.push(currentMessage as Message)
      }

      const timestamp = messageMatch[1]
      const role = messageMatch[2].toLowerCase() as "user" | "assistant" | "system"

      currentMessage = {
        role,
        content: "",
        timestamp: new Date(timestamp).toISOString(),
      }
    } else if (currentMessage && line.trim()) {
      currentMessage.content += (currentMessage.content ? "\n" : "") + line
    }
  }

  if (currentMessage && currentMessage.content) {
    messages.push(currentMessage as Message)
  }

  return messages
}

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, rateLimitConfigs.chat)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please slow down." },
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
    const conversationsDir = path.join(process.cwd(), "admin_ai_conversations")
    const filename = getTodayFilename()
    const filepath = path.join(conversationsDir, filename)

    try {
      const content = await fs.readFile(filepath, "utf-8")
      const messages = parseMarkdownConversation(content)
      return NextResponse.json({ messages })
    } catch (error) {
      return NextResponse.json({ messages: [] })
    }
  } catch (error) {
    console.error("Error loading conversation:", error)
    return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 })
  }
}
