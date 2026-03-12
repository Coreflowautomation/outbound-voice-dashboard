"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { statoBadge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const STATI = ["", "da_chiamare", "appuntamento", "rifiuto", "non_raggiungibile"]
const STATI_LABELS: Record<string, string> = {
  "": "Tutti",
  da_chiamare: "Da chiamare",
  appuntamento: "Appuntamento",
  rifiuto: "Rifiuto",
  non_raggiungibile: "Non raggiungibile",
}

const PAGE_SIZE = 50

interface Contact {
  id: string; nome: string; cognome: string
  telefono: string; stato: string; created_at: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading]   = useState(true)
  const [stato, setStato]       = useState("")
  const [offset, setOffset]     = useState(0)
  const [error, setError]       = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")
    const qs = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (stato) qs.set("stato", stato)
    fetch(`/api/contacts?${qs}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setContacts([]) }
        else setContacts(Array.isArray(d) ? d : d.contacts ?? d.data ?? [])
      })
      .catch(() => setError("Server non raggiungibile"))
      .finally(() => setLoading(false))
  }, [stato, offset])

  const changeStato = (s: string) => { setStato(s); setOffset(0) }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contatti</h1>
        <p className="text-sm text-slate-500 mt-0.5">Anagrafica e stato CRM</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista contatti</CardTitle>
            {/* Filtro stato */}
            <div className="flex gap-2 flex-wrap">
              {STATI.map(s => (
                <button
                  key={s}
                  onClick={() => changeStato(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    stato === s
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {STATI_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <p className="text-center text-red-400 py-10 text-sm">{error}</p>
          ) : loading ? (
            <div className="space-y-3 p-6">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-center text-slate-600 py-10 text-sm">Nessun contatto trovato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cognome</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-white">{c.nome}</TableCell>
                    <TableCell>{c.cognome}</TableCell>
                    <TableCell className="font-mono text-slate-400">{c.telefono}</TableCell>
                    <TableCell>{statoBadge(c.stato)}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{formatDate(c.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Paginazione */}
          {!loading && !error && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Mostrando {offset + 1}–{offset + contacts.length}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0}>
                  <ChevronLeft size={14} /> Precedente
                </Button>
                <Button variant="outline" onClick={() => setOffset(offset + PAGE_SIZE)} disabled={contacts.length < PAGE_SIZE}>
                  Successivo <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
