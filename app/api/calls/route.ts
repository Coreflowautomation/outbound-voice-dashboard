import { apiFetch } from "@/lib/api"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const esito  = searchParams.get("esito") ?? ""
  const limit  = searchParams.get("limit") ?? "100"
  const offset = searchParams.get("offset") ?? "0"

  const qs = new URLSearchParams({ limit, offset })
  if (esito) qs.set("esito", esito)

  try {
    const data = await apiFetch(`/calls/list?${qs}`)
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
