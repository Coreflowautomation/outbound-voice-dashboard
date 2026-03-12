"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, AlertTriangle } from "lucide-react"

const SCORE_COLOR = (n: number) =>
  n >= 7 ? "bg-green-500" : n >= 4 ? "bg-yellow-500" : "bg-destructive"

const esitoBadge = (esito: string) => {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    appuntamento_fissato: "default", rifiuto: "destructive", no_answer: "secondary", script: "outline",
  }
  const labels: Record<string, string> = {
    appuntamento_fissato: "Appuntamento", rifiuto: "Rifiuto", no_answer: "No answer", script: "In corso",
  }
  return <Badge variant={map[esito] ?? "outline"}>{labels[esito] ?? esito}</Badge>
}

interface CallDetail {
  id: string; esito: string; durata_secondi: number; created_at: string
  trascrizione?: string
  contact?: { nome: string; cognome: string; telefono: string }
  analisi?: {
    punteggio_totale?: number; proposta_timing?: number; gestione_obiezioni?: number
    naturalezza?: number; conferma_appuntamento?: number; parole_vietate?: boolean
    errori_tags?: string[]; note?: string
  }
}

const METRICHE: [keyof NonNullable<CallDetail["analisi"]>, string][] = [
  ["proposta_timing", "Proposta timing"],
  ["gestione_obiezioni", "Gestione obiezioni"],
  ["naturalezza", "Naturalezza"],
  ["conferma_appuntamento", "Conferma appuntamento"],
]

export default function CallDetailPage() {
  const { id } = useParams()
  const router  = useRouter()
  const [call, setCall]     = useState<CallDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState("")

  useEffect(() => {
    if (!id) return
    fetch(`/api/calls/${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setCall(d) })
      .catch(() => setError("Server non raggiungibile"))
      .finally(() => setLoading(false))
  }, [id])

  const formatLine = (line: string) => {
    if (line.startsWith("Sofia:") || line.startsWith("AI:"))
      return <p key={line} className="text-primary font-medium">{line}</p>
    if (line.startsWith("Paziente:") || line.startsWith("User:"))
      return <p key={line} className="text-foreground">{line}</p>
    return <p key={line} className="text-muted-foreground text-sm">{line}</p>
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push("/calls")}>
          <ArrowLeft className="size-4" /> Torna alle chiamate
        </Button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-destructive py-10">{error}</p>
        ) : !call ? null : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">
                        {call.contact?.nome} {call.contact?.cognome}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{call.contact?.telefono}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {esitoBadge(call.esito)}
                      <span className="text-xs text-muted-foreground">
                        {Math.floor((call.durata_secondi ?? 0) / 60)}:{((call.durata_secondi ?? 0) % 60).toString().padStart(2, "0")} min
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(call.created_at).toLocaleString("it-IT")}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {call.trascrizione && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Trascrizione</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm font-mono leading-relaxed max-h-96 overflow-y-auto">
                      {call.trascrizione.split("\n").filter(Boolean).map(formatLine)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {call.analisi ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      Analisi AI
                      {call.analisi.punteggio_totale != null && (
                        <span className={`text-lg font-bold ${call.analisi.punteggio_totale >= 7 ? "text-green-500" : call.analisi.punteggio_totale >= 4 ? "text-yellow-500" : "text-destructive"}`}>
                          {call.analisi.punteggio_totale}/10
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {call.analisi.parole_vietate && (
                      <div className="flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-2 text-xs text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="size-3 shrink-0" />
                        Rilevate parole vietate in questa chiamata
                      </div>
                    )}

                    {METRICHE.map(([k, label]) => {
                      const v = call.analisi?.[k] as number | undefined
                      if (v == null) return null
                      return (
                        <div key={k} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium">{v}/10</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className={`h-full rounded-full ${SCORE_COLOR(v)}`} style={{ width: `${v * 10}%` }} />
                          </div>
                        </div>
                      )
                    })}

                    {(call.analisi.errori_tags?.length ?? 0) > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Errori rilevati</p>
                        <div className="flex flex-wrap gap-1">
                          {call.analisi.errori_tags?.map(tag => (
                            <Badge key={tag} variant="destructive" className="text-xs">{tag.replaceAll("_", " ")}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {call.analisi.note && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Note</p>
                        <p className="text-xs leading-relaxed">{call.analisi.note}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-center text-sm text-muted-foreground">Analisi AI non ancora disponibile</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
