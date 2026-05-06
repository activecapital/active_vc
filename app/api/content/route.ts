import { NextResponse } from "next/server"
import { getPublicContent } from "@/lib/content"

export const revalidate = 60

export async function GET() {
  try {
    const content = await getPublicContent()
    return NextResponse.json(content)
  } catch (error) {
    console.error("Content fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}
