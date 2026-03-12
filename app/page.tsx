"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Phone, Calendar, TrendingUp, Activity, RefreshCw } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"

interface Metrics {
  uptime_ore: number
  orario_lavorativo: boolean
  chiamate_oggi: { totale: number; appuntamento_fissato: number; rifiuto: number; no_answer: number }
  sistema: { versione: string; call_hours: string; max_concurrent: number }
  call_manager: { attive: number; completate: number; errori: number }
}

interface DayData { giorno: string; totale: number }

function StatCard({ title, value, sub, icon: Icon, loading }: {
  title: string; value: string | number; sub?: string
  icon: React.ElementType; loading: boolean
}) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <>
            <p className="text-3xl font-bold text-white flex items-center gap-2">
              <Icon size={22} className="text-blue-400" />
              {value}
            </p>
            {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [chart, setChart]     = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState("")

  const fetchAll = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([
        fetch("/api/metrics").then(r => r.json()),
        fetch("/api/analytics/calls-per-day?giorni=7").then(r => r.json()),
      ])
      setMetrics(m)
      setChart(Array.isArray(c) ? c : c.data ?? [])
      setLastUpdate(new Date().toLocaleTimeString("it-IT"))
    } catch {
      // silent — mantieni i dati precedenti
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, 30_000)
    return () => clearInterval(t)
  }, [fetchAll])

  const oggi   = metrics?.chiamate_oggi
  const totale = oggi?.totale ?? 0
  const tasso  = totale > 0 ? Math.round(((oggi?.appuntamento_fissato ?? 0) / totale) * 100) : 0

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitoraggio sistema chiamate in tempo reale
          </p>
        </div>
        <div className="flex items-center gap-3">
          {metrics && (
            <Badge variant={metrics.orario_lavorativo ? "success" : "muted"}>
              {metrics.orario_lavorativo ? "Orario attivo" : "Fuori orario"}
            </Badge>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <RefreshCw size={11} />
            {lastUpdate ? `Aggiornato ${lastUpdate}` : "Caricamento…"}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Chiamate attive"
          value={metrics?.call_manager.attive ?? 0}
          sub={`Max ${metrics?.sistema.max_concurrent ?? "—"} simultanee`}
          icon={Activity}
          loading={loading}
        />
        <StatCard
          title="Completate oggi"
          value={oggi?.totale ?? 0}
          sub={`${oggi?.rifiuto ?? 0} rifiuti · ${oggi?.no_answer ?? 0} no answer`}
          icon={Phone}
          loading={loading}
        />
        <StatCard
          title="Appuntamenti oggi"
          value={oggi?.appuntamento_fissato ?? 0}
          icon={Calendar}
          loading={loading}
        />
        <StatCard
          title="Tasso successo"
          value={`${tasso}%`}
          sub="appuntamenti / chiamate"
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chiamate per giorno — ultimi 7 giorni</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : chart.length === 0 ? (
            <p className="text-center text-slate-600 py-10 text-sm">Nessun dato disponibile</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chart} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="giorno"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                  labelStyle={{ color: "#94a3b8" }}
                  itemStyle={{ color: "#60a5fa" }}
                />
                <Bar dataKey="totale" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Chiamate" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sistema info */}
      {metrics && (
        <Card>
          <CardHeader><CardTitle>Stato sistema</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Versione</p>
                <p className="text-white font-mono">{metrics.sistema.versione}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Orari chiamate</p>
                <p className="text-white">{metrics.sistema.call_hours}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Uptime</p>
                <p className="text-white">{metrics.uptime_ore}h</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Errori sessione</p>
                <p className={metrics.call_manager.errori > 0 ? "text-red-400" : "text-green-400"}>
                  {metrics.call_manager.errori}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
