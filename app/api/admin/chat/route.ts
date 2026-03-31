import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit"
import {
  readFileFromGitHub,
  writeFileToGitHub,
  writeMultipleFiles,
  ensureBranchExists,
} from "@/lib/github-api"
import { getAllContent, updateContent, updateMultipleContent } from "@/lib/content"
import type { SiteContent } from "@/lib/content"

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

function formatDateHeader(): string {
  const today = new Date()
  return today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

async function appendToConversation(message: Message) {
  try {
    const filename = getTodayFilename()
    const filepath = `admin_ai_conversations/${filename}`

    let content = ""
    try {
      const existing = await readFileFromGitHub(filepath, "main")
      content = existing.content
    } catch (error) {
      content = `# Conversation - ${formatDateHeader()}\n\n`
    }

    const roleLabel = message.role.charAt(0).toUpperCase() + message.role.slice(1)
    const timeLabel = formatTime(message.timestamp)

    content += `## ${timeLabel} - ${roleLabel}\n${message.content}\n\n`

    await writeFileToGitHub(filepath, content, `Log conversation: ${roleLabel} at ${timeLabel}`, "main")
  } catch (error) {
    console.warn("Could not save conversation:", (error as Error).message)
  }
}

export const maxDuration = 60

export async function POST(request: NextRequest) {
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
    const { message, history } = await request.json()

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }

    const conversationHistory = history
      .filter((msg: Message) => msg.role !== "system")
      .map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      }))

    const systemPrompt = `You are an AI assistant helping to manage the Active VC website. The website is built with Next.js and deployed on Vercel.

Your role is to:
1. Understand content change requests from the user
2. Read and modify content as needed (preferring the database for editable content)
3. Deploy changes to staging for review
4. Help publish approved changes to production

CONTENT STORED IN DATABASE (Supabase):
The following content is stored in a database and can be updated with the get_site_content and update_site_content tools:
- hero_title: Main heading on the homepage hero section
- hero_subtitle: Subtitle below the main heading
- about_pat: Personal message from Pat Matthews
- about_active_capital: Description of Active Capital
- approach_items: Array of {label, icon} objects for the Approach/How We Invest grid
- contact_html: HTML content for the Contact Us section

IMPORTANT: For any changes to the above content, use get_site_content to read current values and update_site_content to modify them. These changes take effect immediately without needing to deploy to staging.

The website also has these component files (for non-database changes):
- app/components/HowWeInvest.tsx - Investment criteria (reads from DB)
- app/components/Team.tsx - Team member information
- app/components/Portfolio.tsx - Portfolio companies
- app/components/TopHeroCard.tsx - Hero section (reads from DB)
- app/components/Contact.tsx - Contact information
- app/components/Testimonials.tsx - Testimonials

Available tools:
- get_site_content: Read all current site content from the database
- update_site_content: Update one or more content fields in the database
- read_file: Read file contents from GitHub
- write_file: Write/update file contents on GitHub
- deploy_to_staging: Deploy file changes to staging branch

Workflow:
1. For database content changes: use get_site_content and update_site_content (instant, no deploy needed)
2. For file-based changes: read the file, modify it, write it, deploy to staging
3. Explain what you changed
4. For file changes, tell user to review at staging URL

Be concise and proactive. Make changes confidently when requested.`

    const tools = [
      {
        name: "get_site_content",
        description: "Read all current site content from the Supabase database. Returns hero_title, hero_subtitle, about_pat, about_active_capital, approach_items, and contact_html.",
        input_schema: {
          type: "object" as const,
          properties: {},
          required: [] as string[],
        },
      },
      {
        name: "update_site_content",
        description: "Update one or more content fields in the Supabase database. Changes take effect immediately. Valid keys: hero_title, hero_subtitle, about_pat, about_active_capital, approach_items (array of {label, icon}), contact_html (HTML string).",
        input_schema: {
          type: "object" as const,
          properties: {
            updates: {
              type: "object" as const,
              description: "Object with content keys and their new values. e.g. { hero_title: 'New Title', about_pat: 'New bio...' }",
            },
          },
          required: ["updates"],
        },
      },
      {
        name: "read_file",
        description: "Read the contents of a file in the project from GitHub",
        input_schema: {
          type: "object" as const,
          properties: {
            filepath: {
              type: "string" as const,
              description: "Path to the file relative to project root (e.g., 'app/components/HowWeInvest.tsx')",
            },
          },
          required: ["filepath"],
        },
      },
      {
        name: "write_file",
        description: "Write or update a file in the project on GitHub staging branch",
        input_schema: {
          type: "object" as const,
          properties: {
            filepath: {
              type: "string" as const,
              description: "Path to the file relative to project root",
            },
            content: {
              type: "string" as const,
              description: "The complete new content for the file",
            },
          },
          required: ["filepath", "content"],
        },
      },
      {
        name: "deploy_to_staging",
        description: "Deploy changes to the staging branch for review",
        input_schema: {
          type: "object" as const,
          properties: {
            files: {
              type: "array" as const,
              items: { type: "string" as const },
              description: "List of files that were modified",
            },
            message: {
              type: "string" as const,
              description: "Commit message describing the changes",
            },
          },
          required: ["files", "message"],
        },
      },
    ]

    const MAX_TOOL_ROUNDS = 5
    let assistantContent = ""
    let currentMessages: any[] = [...conversationHistory, { role: "user", content: message }]

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages: currentMessages,
      })

      const textParts: string[] = []
      const toolResults: any[] = []

      for (const block of response.content) {
        if (block.type === "text") {
          textParts.push(block.text)
        } else if (block.type === "tool_use") {
          const toolName = block.name
          const toolInput = block.input as any
          let toolResult: any = {}

          try {
            if (toolName === "get_site_content") {
              const siteContent = await getAllContent()
              toolResult = siteContent
            } else if (toolName === "update_site_content") {
              const result = await updateMultipleContent(toolInput.updates)
              if (result.success) {
                toolResult = { success: true, message: "Content updated in database. Changes are live immediately.", updated_keys: Object.keys(toolInput.updates) }
              } else {
                toolResult = { error: result.error || "Failed to update content" }
              }
            } else if (toolName === "read_file") {
              const file = await readFileFromGitHub(toolInput.filepath, "staging")
              toolResult = { content: file.content }
            } else if (toolName === "write_file") {
              await ensureBranchExists("staging")
              await writeFileToGitHub(
                toolInput.filepath,
                toolInput.content,
                `Update ${toolInput.filepath} via admin panel`,
                "staging"
              )
              toolResult = { success: true, message: `File updated on staging: ${toolInput.filepath}` }
            } else if (toolName === "deploy_to_staging") {
              // Files were already written to staging branch via write_file
              // This tool now just confirms the deployment
              await ensureBranchExists("staging")
              toolResult = {
                success: true,
                message: "Changes committed to staging branch. Vercel will auto-deploy.",
              }
            }
          } catch (error) {
            toolResult = { error: error instanceof Error ? error.message : "Tool execution failed" }
          }

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(toolResult),
          })
        }
      }

      assistantContent += textParts.join("\n")

      if (response.stop_reason === "end_turn" || toolResults.length === 0) {
        break
      }

      currentMessages = [
        ...currentMessages,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ]
    }

    const assistantMessage: Message = {
      role: "assistant",
      content: assistantContent,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
