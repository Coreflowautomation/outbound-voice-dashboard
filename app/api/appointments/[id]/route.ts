import { apiFetch } from "@/lib/api"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await apiFetch(`/appointments/${id}`, { method: "DELETE" })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
