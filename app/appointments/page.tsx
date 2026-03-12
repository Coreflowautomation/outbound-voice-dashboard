"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 50

interface Appointment {
  id: string; data_ora: string; confermato: boolean
  contact_nome?: string; contact_cognome?: string
}

export default function AppointmentsPage() {
  const [items, setItems]         = useState<Appointment[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")
  const [offset, setOffset]       = useState(0)
  const [toDelete, setToDelete]   = useState<Appointment | null>(null)
  const [deleting, setDeleting]   = useState(false)

  const load = (off = offset) => {
    setLoading(true)
    setError("")
    fetch(`/api/appointments?limit=${PAGE_SIZE}&offset=${off}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setItems([]) }
        else setItems(Array.isArray(d) ? d : d.appointments ?? d.data ?? [])
      })
      .catch(() => setError("Server non raggiungibile"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [offset]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      const r = await fetch(`/api/appointments/${toDelete.id}`, { method: "DELETE" })
      const d = await r.json()
      if (d.error) { setError(d.error) }
      else { setItems(prev => prev.filter(a => a.id !== toDelete.id)) }
    } catch {
      setError("Errore durante la cancellazione")
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Appuntamenti</h1>
        <p className="text-sm text-slate-500 mt-0.5">Appuntamenti confermati</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Lista appuntamenti</CardTitle></CardHeader>
        <CardContent className="p-0">
          {error && <p className="text-center text-red-400 py-6 text-sm px-6">{error}</p>}
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : items.length === 0 && !error ? (
            <p className="text-center text-slate-600 py-10 text-sm">Nessun appuntamento trovato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paziente</TableHead>
                  <TableHead>Data e ora</TableHead>
                  <TableHead>Confermato</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-white">
                      {a.contact_nome ?? "—"} {a.contact_cognome ?? ""}
                    </TableCell>
                    <TableCell className="text-slate-300">{formatDate(a.data_ora)}</TableCell>
                    <TableCell>
                      <Badge variant={a.confermato ? "success" : "muted"}>
                        {a.confermato ? "Confermato" : "In attesa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setToDelete(a)}
                        className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        title="Cancella appuntamento"
                      >
                        <Trash2 size={14} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && !error && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">Mostrando {offset + 1}–{offset + items.length}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0}>
                  <ChevronLeft size={14} /> Precedente
                </Button>
                <Button variant="outline" onClick={() => setOffset(offset + PAGE_SIZE)} disabled={items.length < PAGE_SIZE}>
                  Successivo <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale conferma cancellazione */}
      <Dialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Cancella appuntamento"
      >
        <p className="text-sm text-slate-300 mb-6">
          Vuoi cancellare l&apos;appuntamento di{" "}
          <strong className="text-white">
            {toDelete?.contact_nome} {toDelete?.contact_cognome}
          </strong>{" "}
          del{" "}
          <strong className="text-white">{toDelete ? formatDate(toDelete.data_ora) : ""}</strong>?
          <br />
          <span className="text-slate-500 text-xs mt-1 block">Questa azione non può essere annullata.</span>
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setToDelete(null)}>Annulla</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Cancellazione…" : "Sì, cancella"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
