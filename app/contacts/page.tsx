"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight } from "lucide-react"

const STATI = ["", "da_chiamare", "appuntamento", "rifiuto", "non_raggiungibile"]
const STATI_LABELS: Record<string, string> = {
  "": "Tutti", da_chiamare: "Da chiamare", appuntamento: "Appuntamento",
  rifiuto: "Rifiuto", non_raggiungibile: "Non raggiungibile",
}

const statoBadge = (stato: string) => {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    da_chiamare: "default", appuntamento: "default",
    rifiuto: "destructive", non_raggiungibile: "secondary",
  }
  const labels: Record<string, string> = {
    da_chiamare: "Da chiamare", appuntamento: "Appuntamento",
    rifiuto: "Rifiuto", non_raggiungibile: "Non raggiungibile",
  }
  return <Badge variant={map[stato] ?? "outline"}>{labels[stato] ?? stato}</Badge>
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
    setLoading(true); setError("")
    const qs = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (stato) qs.set("stato", stato)
    fetch(`/api/contacts?${qs}`)
      .then(r => r.json())
      .then(d => { if (d.error) { setError(d.error); setContacts([]) } else setContacts(Array.isArray(d) ? d : d.contacts ?? d.data ?? []) })
      .catch(() => setError("Server non raggiungibile"))
      .finally(() => setLoading(false))
  }, [stato, offset])

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Anagrafica e stato CRM</p>
          <div className="flex gap-2 flex-wrap">
            {STATI.map(s => (
              <button key={s} onClick={() => { setStato(s); setOffset(0) }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${stato === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {STATI_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          {error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : loading ? (
            <div className="space-y-2 p-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : contacts.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nessun contatto trovato</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead><TableHead>Cognome</TableHead>
                  <TableHead>Telefono</TableHead><TableHead>Stato</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.cognome}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{c.telefono}</TableCell>
                    <TableCell>{statoBadge(c.stato)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(c.created_at).toLocaleDateString("it-IT")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!loading && !error && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Mostrando {offset + 1}–{offset + contacts.length}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0}>
                <ChevronLeft className="size-4" /> Precedente
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOffset(offset + PAGE_SIZE)} disabled={contacts.length < PAGE_SIZE}>
                Successivo <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
