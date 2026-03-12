"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"

const PAGE_SIZE = 50

interface Appointment {
  id: string; data_ora: string; confermato: boolean
  contact_nome?: string; call_id?: string
}

export default function AppointmentsPage() {
  const [list, setList]       = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset]   = useState(0)
  const [error, setError]     = useState("")
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true); setError("")
    fetch(`/api/appointments?limit=${PAGE_SIZE}&offset=${offset}`)
      .then(r => r.json())
      .then(d => { if (d.error) { setError(d.error); setList([]) } else setList(Array.isArray(d) ? d : d.appointments ?? d.data ?? []) })
      .catch(() => setError("Server non raggiungibile"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [offset])

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    await fetch(`/api/appointments/${toDelete}`, { method: "DELETE" })
    setToDelete(null)
    setDeleting(false)
    load()
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
        <p className="text-sm text-muted-foreground">Appuntamenti confermati dal sistema</p>

        <div className="overflow-hidden rounded-lg border">
          {error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : loading ? (
            <div className="space-y-2 p-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : list.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nessun appuntamento trovato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paziente</TableHead><TableHead>Data / Ora</TableHead>
                  <TableHead>Confermato</TableHead><TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.contact_nome ?? "—"}</TableCell>
                    <TableCell>{new Date(a.data_ora).toLocaleString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</TableCell>
                    <TableCell>
                      {a.confermato
                        ? <Badge variant="default">Sì</Badge>
                        : <Badge variant="secondary">In attesa</Badge>}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => setToDelete(a.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!loading && !error && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Mostrando {offset + 1}–{offset + list.length}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0}>
                <ChevronLeft className="size-4" /> Precedente
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOffset(offset + PAGE_SIZE)} disabled={list.length < PAGE_SIZE}>
                Successivo <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-lg border bg-card p-6 shadow-lg w-80 space-y-4">
            <h2 className="font-semibold">Conferma cancellazione</h2>
            <p className="text-sm text-muted-foreground">Sei sicuro di voler cancellare questo appuntamento? L&apos;azione è irreversibile.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setToDelete(null)} disabled={deleting}>Annulla</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Cancellando…" : "Cancella"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
