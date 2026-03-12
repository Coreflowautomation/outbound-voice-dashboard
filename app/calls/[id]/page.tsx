"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge, esitoBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatDuration } from "@/lib/utils"
import { ArrowLeft, AlertTriangle } from "lucide-react"

const TAG_LABELS: Record<string, string> = {
  prezzo_menzionato:         "Ha menzionato prezzi",
  slot_non_proposto:         "Slot non proposto",
  obiezione_non_gestita:     "Obiezione non gestita",
  conversazione_artificiosa: "Tono artificioso",
  conferma_mancata:          "Conferma mancata",
  fine_prematura:            "Fine prematura",
  risposta_troppo_lunga:     "Risposta troppo lunga",
  risposta_troppo_corta:     "Risposta troppo corta",
  tono_non_empatico:         "Tono non empatico",
  interruzione_prematura:    "Interruzione prematura",
  mancata_qualificazione:    "Mancata qualificazione",
  saluto_inadeguato:         "Saluto inadeguato",
}

interface Analisi {
  punteggio_totale: number; proposta_timing: number
  gestione_obiezioni: number; naturalezza: number
  conferma_appuntamento: number; parole_vietate: boolean
  errori_tags: string[]; note: string
}

interface CallDetail {
  id: string; esito: string; durata_secondi: number
  created_at: string; trascrizione: string
  contact: { nome: string; cognome: string; telefono: string }
  analisi?: Analisi
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  const color = score >= 7 ? "bg-green-500" : score >= 4 ? "bg-yellow-500" : "bg-red-500"
  const textColor = score >= 7 ? "text-green-400" : score >= 4 ? "text-yellow-400" : "text-red-400"
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400 w-48 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-700">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className={`text-sm font-semibold w-10 text-right ${textColor}`}>{score}/10</span>
    </div>
  )
}

function TranscriptLine({ line }: { line: string }) {
  const isSofia = line.startsWith("Sofia:")
  return (
    <div className={`flex gap-3 ${isSofia ? "" : "flex-row-reverse"}`}>
      <div className={`flex-1 rounded-xl px-4 py-2.5 text-sm max-w-[80%] ${
        isSofia
          ? "bg-slate-800 text-slate-200 rounded-tl-none"
          : "bg-blue-900/40 text-blue-100 rounded-tr-none text-right"
      }`}>
        {isSofia ? line.replace("Sofia: ", "") : line.replace(/^Paziente:\s?/, "")}
      </div>
    </div>
  )
}

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [call, setCall]     = useState<CallDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState("")

  useEffect(() => {
    fetch(`/api/calls/${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setCall(d) })
      .catch(() => setError("Server non raggiungibile"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )

  if (error) return (
    <div className="p-8">
      <p className="text-red-400">{error}</p>
      <Button variant="ghost" onClick={() => router.back()} className="mt-4">
        <ArrowLeft size={14} /> Torna indietro
      </Button>
    </div>
  )

  if (!call) return null

  const lines = (call.trascrizione ?? "").split("\n").filter(Boolean)

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {/* Back */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft size={14} /> Chiamate
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {call.contact.nome} {call.contact.cognome}
          </h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">{call.contact.telefono}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {esitoBadge(call.esito)}
          <span className="text-sm text-slate-400">{formatDuration(call.durata_secondi ?? 0)}</span>
          <span className="text-sm text-slate-500">{formatDate(call.created_at)}</span>
        </div>
      </div>

      {/* Analisi AI */}
      {call.analisi && (
        <Card>
          <CardHeader><CardTitle>Analisi AI</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {call.analisi.parole_vietate && (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-900/30 border border-yellow-800 px-4 py-3">
                <AlertTriangle size={16} className="text-yellow-400" />
                <span className="text-sm text-yellow-300">Rilevate parole vietate in questa chiamata</span>
              </div>
            )}

            <div className="space-y-3">
              <ScoreRow label="Punteggio totale"       score={call.analisi.punteggio_totale} />
              <ScoreRow label="Timing proposta"        score={call.analisi.proposta_timing} />
              <ScoreRow label="Gestione obiezioni"     score={call.analisi.gestione_obiezioni} />
              <ScoreRow label="Naturalezza"            score={call.analisi.naturalezza} />
              <ScoreRow label="Conferma appuntamento"  score={call.analisi.conferma_appuntamento} />
            </div>

            {call.analisi.errori_tags?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Errori rilevati</p>
                <div className="flex flex-wrap gap-2">
                  {call.analisi.errori_tags.map(tag => (
                    <Badge key={tag} variant="danger">
                      {TAG_LABELS[tag] ?? tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {call.analisi.note && (
              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Note analista AI</p>
                <p className="text-sm text-slate-300 bg-slate-800 rounded-lg px-4 py-3 leading-relaxed">
                  {call.analisi.note}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trascrizione */}
      <Card>
        <CardHeader><CardTitle>Trascrizione</CardTitle></CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <p className="text-slate-600 text-sm">Trascrizione non disponibile</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {lines.map((line, i) => <TranscriptLine key={i} line={line} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
