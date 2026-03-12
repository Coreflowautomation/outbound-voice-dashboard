import { apiFetch } from "@/lib/api"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const stato  = searchParams.get("stato") ?? ""
  const limit  = searchParams.get("limit") ?? "100"
  const offset = searchParams.get("offset") ?? "0"

  const qs = new URLSearchParams({ limit, offset })
  if (stato) qs.set("stato", stato)

  try {
    const data = await apiFetch(`/contacts?${qs}`)
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
