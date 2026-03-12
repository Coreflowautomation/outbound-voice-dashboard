"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"
import { Sparkles } from "lucide-react"

interface ErrorTag { tag: string; count: number }
interface PromptVersion { id: string; versione: number; attivo: boolean; created_at: string; prompt_fragment?: string; performance_media?: number }

export default function AnalyticsPage() {
  const [errors, setErrors]       = useState<ErrorTag[]>([])
  const [prompts, setPrompts]     = useState<PromptVersion[]>([])
  const [giorni, setGiorni]       = useState("7")
  const [loading, setLoading]     = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [confirmOpt, setConfirmOpt] = useState(false)
  const [optResult, setOptResult]   = useState("")
  const [error, setError]         = useState("")

  useEffect(() => {
    setLoading(true); setError("")
    Promise.all([
      fetch(`/api/analytics/errors?giorni=${giorni}`).then(r => r.json()),
      fetch("/api/analytics/prompt-history").then(r => r.json()),
    ])
      .then(([e, p]) => {
        setErrors(Array.isArray(e) ? e : e.data ?? [])
        setPrompts(Array.isArray(p) ? p : p.data ?? [])
      })
      .catch(() => setError("Server non raggiungibile"))
      .finally(() => setLoading(false))
  }, [giorni])

  const handleOptimize = async () => {
    setConfirmOpt(false); setOptimizing(true); setOptResult("")
    try {
      const r = await fetch("/api/analytics/optimize", { method: "POST" })
      const d = await r.json()
      setOptResult(d.message ?? d.versione ?? "Ottimizzazione completata")
    } catch {
      setOptResult("Errore durante l'ottimizzazione")
    } finally {
      setOptimizing(false)
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Errori frequenti</CardTitle>
            <div className="flex gap-2">
              {["7", "14", "30"].map(g => (
                <button key={g} onClick={() => setGiorni(g)}
                  className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${giorni === g ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {g}g
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : errors.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nessun errore registrato</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={errors} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="tag" type="category" width={170} tick={{ fontSize: 11 }}
                    tickFormatter={v => v.replaceAll("_", " ")} />
                  <Tooltip formatter={(v) => [v, "Occorrenze"]} labelFormatter={l => l.replaceAll("_", " ")} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Storico versioni prompt di Sofia</CardTitle>
            <Button size="sm" onClick={() => setConfirmOpt(true)} disabled={optimizing}>
              <Sparkles className="size-4" />
              {optimizing ? "Ottimizzazione…" : "Ottimizza prompt ora"}
            </Button>
          </CardHeader>
          <CardContent>
            {optResult && (
              <div className="mb-4 rounded-md border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
                {optResult}
              </div>
            )}
            {loading ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : prompts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">Nessuna versione prompt trovata</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Versione</TableHead><TableHead>Stato</TableHead>
                    <TableHead>Performance</TableHead><TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">v{p.versione}</TableCell>
                      <TableCell>
                        {p.attivo
                          ? <Badge variant="default">Attiva</Badge>
                          : <Badge variant="secondary">Archivio</Badge>}
                      </TableCell>
                      <TableCell>
                        {p.performance_media != null
                          ? <span className={p.performance_media >= 7 ? "text-green-500 font-medium" : p.performance_media >= 4 ? "text-yellow-500 font-medium" : "text-destructive font-medium"}>
                              {p.performance_media.toFixed(1)}/10
                            </span>
                          : <span className="text-muted-foreground text-xs">N/D</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(p.created_at).toLocaleDateString("it-IT")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {confirmOpt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-lg border bg-card p-6 shadow-lg w-80 space-y-4">
            <h2 className="font-semibold">Ottimizza prompt</h2>
            <p className="text-sm text-muted-foreground">Verrà generata una nuova versione del prompt di Sofia basata sulle ultime analisi. Procedere?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmOpt(false)}>Annulla</Button>
              <Button size="sm" onClick={handleOptimize}>Ottimizza</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
