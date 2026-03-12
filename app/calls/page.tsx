"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ESITI = ["", "appuntamento_fissato", "rifiuto", "no_answer", "script"]
const ESITI_LABELS: Record<string, string> = {
  "": "Tutti", appuntamento_fissato: "Appuntamento",
  rifiuto: "Rifiuto", no_answer: "No answer", script: "In corso",
}

const esitoBadge = (esito: string) => {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    appuntamento_fissato: "default", rifiuto: "destructive",
    no_answer: "secondary", script: "outline",
  }
  return <Badge variant={map[esito] ?? "outline"}>{ESITI_LABELS[esito] ?? esito}</Badge>
}

const PAGE_SIZE = 50

interface Call {
  id: string; esito: string; durata_secondi: number
  created_at: string; contact_nome?: string; punteggio_totale?: number
}

export default function CallsPage() {
  const router = useRouter()
  const [calls, setCalls]     = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [esito, setEsito]     = useState("")
  const [offset, setOffset]   = useState(0)
  const [error, setError]     = useState("")

  useEffect(() => {
    setLoading(true); setError("")
    const qs = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (esito) qs.set("esito", esito)
    fetch(`/api/calls?${qs}`)
      .then(r => r.json())
      .then(d => { if (d.error) { setError(d.error); setCalls([]) } else setCalls(Array.isArray(d) ? d : d.calls ?? d.data ?? []) })
      .catch(() => setError("Server non raggiungibile"))
      .finally(() => setLoading(false))
  }, [esito, offset])

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Storico tutte le chiamate</p>
          <div className="flex gap-2 flex-wrap">
            {ESITI.map(e => (
              <button key={e} onClick={() => { setEsito(e); setOffset(0) }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${esito === e ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {ESITI_LABELS[e]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          {error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : loading ? (
            <div className="space-y-2 p-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : calls.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nessuna chiamata trovata</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paziente</TableHead><TableHead>Esito</TableHead>
                  <TableHead>Durata</TableHead><TableHead>Score AI</TableHead><TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map(c => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/calls/${c.id}`)}>
                    <TableCell className="font-medium">{c.contact_nome ?? "—"}</TableCell>
                    <TableCell>{esitoBadge(c.esito)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {Math.floor((c.durata_secondi ?? 0) / 60)}:{((c.durata_secondi ?? 0) % 60).toString().padStart(2, "0")}
                    </TableCell>
                    <TableCell>
                      {c.punteggio_totale != null ? (
                        <span className={c.punteggio_totale >= 7 ? "text-green-500 font-medium" : c.punteggio_totale >= 4 ? "text-yellow-500 font-medium" : "text-destructive font-medium"}>
                          {c.punteggio_totale}/10
                        </span>
                      ) : <span className="text-muted-foreground text-xs">N/D</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(c.created_at).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!loading && !error && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Mostrando {offset + 1}–{offset + calls.length}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0}>
                <ChevronLeft className="size-4" /> Precedente
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOffset(offset + PAGE_SIZE)} disabled={calls.length < PAGE_SIZE}>
                Successivo <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
