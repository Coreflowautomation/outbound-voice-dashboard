"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { esitoBadge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatDuration } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ChevronRight as Arrow } from "lucide-react"

const ESITI = ["", "appuntamento_fissato", "rifiuto", "no_answer", "script"]
const ESITI_LABELS: Record<string, string> = {
  "": "Tutti", appuntamento_fissato: "Appuntamento",
  rifiuto: "Rifiuto", no_answer: "No answer", script: "In corso",
}

const PAGE_SIZE = 50

interface Call {
  id: string; esito: string; durata_secondi: number
  created_at: string; contact_nome?: string; punteggio_totale?: number
}

function ScoreBar({ score }: { score?: number }) {
  if (!score) return <span className="text-slate-600 text-xs">N/D</span>
  const color = score >= 7 ? "bg-green-500" : score >= 4 ? "bg-yellow-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-slate-700">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-xs text-slate-400">{score}/10</span>
    </div>
  )
}

export default function CallsPage() {
  const router = useRouter()
  const [calls, setCalls]   = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [esito, setEsito]   = useState("")
  const [offset, setOffset] = useState(0)
  const [error, setError]   = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")
    const qs = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (esito) qs.set("esito", esito)
    fetch(`/api/calls?${qs}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setCalls([]) }
        else setCalls(Array.isArray(d) ? d : d.calls ?? d.data ?? [])
      })
      .catch(() => setError("Server non raggiungibile"))
      .finally(() => setLoading(false))
  }, [esito, offset])

  const changeEsito = (e: string) => { setEsito(e); setOffset(0) }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Chiamate</h1>
        <p className="text-sm text-slate-500 mt-0.5">Storico tutte le chiamate</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista chiamate</CardTitle>
            <div className="flex gap-2 flex-wrap">
              {ESITI.map(e => (
                <button
                  key={e}
                  onClick={() => changeEsito(e)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    esito === e ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {ESITI_LABELS[e]}
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
          ) : calls.length === 0 ? (
            <p className="text-center text-slate-600 py-10 text-sm">Nessuna chiamata trovata</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paziente</TableHead>
                  <TableHead>Esito</TableHead>
                  <TableHead>Durata</TableHead>
                  <TableHead>Punteggio AI</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map(c => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/calls/${c.id}`)}
                  >
                    <TableCell className="font-medium text-white">{c.contact_nome ?? "—"}</TableCell>
                    <TableCell>{esitoBadge(c.esito)}</TableCell>
                    <TableCell className="text-slate-400">{formatDuration(c.durata_secondi ?? 0)}</TableCell>
                    <TableCell><ScoreBar score={c.punteggio_totale} /></TableCell>
                    <TableCell className="text-slate-500 text-xs">{formatDate(c.created_at)}</TableCell>
                    <TableCell><Arrow size={14} className="text-slate-600" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && !error && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Mostrando {offset + 1}–{offset + calls.length}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0}>
                  <ChevronLeft size={14} /> Precedente
                </Button>
                <Button variant="outline" onClick={() => setOffset(offset + PAGE_SIZE)} disabled={calls.length < PAGE_SIZE}>
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
