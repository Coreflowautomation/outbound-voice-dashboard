import { apiFetch } from "@/lib/api"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const giorni = req.nextUrl.searchParams.get("giorni") ?? "7"
  try {
    const data = await apiFetch(`/analytics/calls-per-day?giorni=${giorni}`)
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
