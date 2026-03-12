import { apiFetch } from "@/lib/api"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await apiFetch("/analytics/prompt-history")
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
