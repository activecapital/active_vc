import { NextResponse } from "next/server"
import { getAllContent } from "@/lib/content"

export const revalidate = 60

export async function GET() {
  try {
    const content = await getAllContent()
    return NextResponse.json(content)
  } catch (error) {
    console.error("Content fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}
