"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface Call {
  id: string
  esito: string
  durata_secondi: number
  created_at: string
  contact_nome?: string
  punteggio_totale?: number
}

const esitoBadge = (esito: string) => {
  const map: Record<string, { label: string; variant: "default" | "outline" | "destructive" | "secondary" }> = {
    appuntamento_fissato: { label: "Appuntamento", variant: "default" },
    rifiuto:              { label: "Rifiuto",       variant: "destructive" },
    no_answer:            { label: "No answer",     variant: "secondary" },
    script:               { label: "In corso",      variant: "outline" },
  }
  const e = map[esito] ?? { label: esito, variant: "outline" as const }
  return <Badge variant={e.variant}>{e.label}</Badge>
}

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

export function DataTable() {
  const router = useRouter()
  const [calls, setCalls] = React.useState<Call[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/calls?limit=20&offset=0")
      .then(r => r.json())
      .then(d => setCalls(Array.isArray(d) ? d : d.calls ?? d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-3">
        <h2 className="text-base font-semibold">Chiamate recenti</h2>
        <p className="text-sm text-muted-foreground">Ultime 20 chiamate del sistema</p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paziente</TableHead>
              <TableHead>Esito</TableHead>
              <TableHead>Durata</TableHead>
              <TableHead>Score AI</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : calls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nessuna chiamata trovata
                </TableCell>
              </TableRow>
            ) : (
              calls.map(c => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/calls/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.contact_nome ?? "—"}</TableCell>
                  <TableCell>{esitoBadge(c.esito)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDuration(c.durata_secondi ?? 0)}</TableCell>
                  <TableCell>
                    {c.punteggio_totale != null ? (
                      <span className={
                        c.punteggio_totale >= 7 ? "text-green-500 font-medium" :
                        c.punteggio_totale >= 4 ? "text-yellow-500 font-medium" :
                        "text-destructive font-medium"
                      }>
                        {c.punteggio_totale}/10
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">N/D</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatDate(c.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
