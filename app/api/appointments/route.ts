import { apiFetch } from "@/lib/api"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const limit  = searchParams.get("limit") ?? "50"
  const offset = searchParams.get("offset") ?? "0"

  try {
    const data = await apiFetch(`/appointments?limit=${limit}&offset=${offset}`)
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
