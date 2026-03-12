"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import { Sparkles, CheckCircle2 } from "lucide-react"

const TAG_LABELS: Record<string, string> = {
  prezzo_menzionato: "Prezzi menzionati",
  slot_non_proposto: "Slot non proposto",
  obiezione_non_gestita: "Obiezione non gestita",
  conversazione_artificiosa: "Tono artificioso",
  conferma_mancata: "Conferma mancata",
  fine_prematura: "Fine prematura",
  risposta_troppo_lunga: "Risposta lunga",
  risposta_troppo_corta: "Risposta corta",
  tono_non_empatico: "Tono non empatico",
  interruzione_prematura: "Interruzione prematura",
  mancata_qualificazione: "Mancata qualificazione",
  saluto_inadeguato: "Saluto inadeguato",
}

const GIORNI_OPTIONS = [7, 14, 30]

interface ErrorData { tag: string; count: number }
interface PromptVersion {
  version: number; attivo: boolean; created_at: string
  performance_avg: number | null; note_ottimizzatore: string | null
  prompt_anteprima: string
}
interface OptimizeResult { ottimizzato: boolean; versione?: number; note?: string; messaggio?: string }

export default function AnalyticsPage() {
  const [errors, setErrors]       = useState<ErrorData[]>([])
  const [prompts, setPrompts]     = useState<PromptVersion[]>([])
  const [giorni, setGiorni]       = useState(7)
  const [loading, setLoading]     = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [optimizing, setOptimizing]  = useState(false)
  const [optResult, setOptResult]    = useState<OptimizeResult | null>(null)
  const [error, setError]          = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")
    Promise.all([
      fetch(`/api/analytics/errors?giorni=${giorni}`).then(r => r.json()),
      fetch("/api/analytics/prompt-history").then(r => r.json()),
    ]).then(([e, p]) => {
      const errArr: ErrorData[] = Array.isArray(e) ? e : e.data ?? Object.entries(e as Record<string,number>).map(([tag, count]) => ({ tag, count }))
      setErrors(errArr.sort((a, b) => b.count - a.count))
      setPrompts(Array.isArray(p) ? p : p.versioni ?? [])
    }).catch(() => setError("Errore caricamento dati"))
    .finally(() => setLoading(false))
  }, [giorni])

  const handleOptimize = async () => {
    setShowConfirm(false)
    setOptimizing(true)
    setOptResult(null)
    try {
      const r = await fetch("/api/analytics/optimize", { method: "POST" })
      setOptResult(await r.json())
    } catch {
      setError("Errore durante l'ottimizzazione")
    } finally {
      setOptimizing(false)
    }
  }

  const chartData = errors.map(e => ({
    name: TAG_LABELS[e.tag] ?? e.tag,
    count: e.count,
  }))

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Performance e ottimizzazione prompt</p>
        </div>
        <Button onClick={() => setShowConfirm(true)} disabled={optimizing}>
          <Sparkles size={14} />
          {optimizing ? "Ottimizzazione…" : "Ottimizza prompt"}
        </Button>
      </div>

      {optResult && (
        <div className={`flex items-start gap-3 rounded-xl border px-5 py-4 ${
          optResult.ottimizzato
            ? "bg-green-900/20 border-green-800"
            : "bg-slate-800 border-slate-700"
        }`}>
          <CheckCircle2 size={16} className={optResult.ottimizzato ? "text-green-400 mt-0.5" : "text-slate-500 mt-0.5"} />
          <div>
            {optResult.ottimizzato ? (
              <>
                <p className="text-sm font-medium text-green-300">Prompt ottimizzato — versione {optResult.versione}</p>
                {optResult.note && <p className="text-xs text-green-400/70 mt-0.5">{optResult.note}</p>}
              </>
            ) : (
              <p className="text-sm text-slate-400">{optResult.messaggio}</p>
            )}
          </div>
          <button onClick={() => setOptResult(null)} className="ml-auto text-slate-600 hover:text-slate-400 text-xs">✕</button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Errori frequenti */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Errori più frequenti</CardTitle>
            <div className="flex gap-2">
              {GIORNI_OPTIONS.map(g => (
                <button
                  key={g}
                  onClick={() => setGiorni(g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    giorni === g ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {g}g
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : chartData.length === 0 ? (
            <p className="text-center text-slate-600 py-10 text-sm">Nessun errore rilevato nel periodo</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                  labelStyle={{ color: "#94a3b8" }}
                  itemStyle={{ color: "#f87171" }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} name="Occorrenze" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Storico prompt */}
      <Card>
        <CardHeader><CardTitle>Storico versioni prompt di Sofia</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : prompts.length === 0 ? (
            <p className="text-center text-slate-600 py-10 text-sm">Nessuna versione disponibile</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versione</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map(p => (
                  <TableRow key={p.version}>
                    <TableCell className="font-mono text-white">v{p.version}</TableCell>
                    <TableCell>
                      <Badge variant={p.attivo ? "success" : "muted"}>
                        {p.attivo ? "Attivo" : "Archiviato"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.performance_avg != null ? (
                        <span className={`text-sm font-medium ${
                          p.performance_avg >= 7 ? "text-green-400" :
                          p.performance_avg >= 4 ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {p.performance_avg.toFixed(1)}/10
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">N/D</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">{formatDate(p.created_at)}</TableCell>
                    <TableCell className="text-slate-400 text-xs max-w-xs truncate">
                      {p.note_ottimizzatore ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modale conferma ottimizzazione */}
      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)} title="Ottimizza prompt">
        <p className="text-sm text-slate-300 mb-6">
          Stai per avviare un&apos;ottimizzazione del prompt di Sofia usando le analisi AI più recenti.
          Il processo creerà una nuova versione del prompt che verrà usata per le chiamate future.
          <br />
          <span className="text-slate-500 text-xs mt-2 block">
            Consigliato solo con almeno 10 chiamate analizzate.
          </span>
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowConfirm(false)}>Annulla</Button>
          <Button onClick={handleOptimize}>
            <Sparkles size={14} /> Avvia ottimizzazione
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
