import { apiFetch } from "@/lib/api"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const data = await apiFetch("/analytics/optimize?force=true", { method: "POST" })
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
