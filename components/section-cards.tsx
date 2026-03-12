"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, PhoneIcon, CalendarIcon, ActivityIcon, TrendingDownIcon } from "lucide-react"

interface Metrics {
  call_manager: { attive: number; completate: number; errori: number }
  chiamate_oggi: { totale: number; appuntamento_fissato: number; rifiuto: number; no_answer: number }
  orario_lavorativo: boolean
}

export function SectionCards() {
  const [m, setM] = useState<Metrics | null>(null)

  useEffect(() => {
    fetch("/api/metrics")
      .then(r => r.json())
      .then(setM)
      .catch(() => {})
  }, [])

  const totale = m?.chiamate_oggi?.totale ?? 0
  const appuntamenti = m?.chiamate_oggi?.appuntamento_fissato ?? 0
  const tasso = totale > 0 ? Math.round((appuntamenti / totale) * 100) : 0
  const attive = m?.call_manager?.attive ?? 0
  const tassoUp = tasso >= 30

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Chiamate attive</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {m ? attive : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ActivityIcon />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            In corso adesso <ActivityIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {m?.orario_lavorativo ? "Orario lavorativo attivo" : "Fuori orario"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Chiamate oggi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {m ? totale : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <PhoneIcon />
              Oggi
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {m?.chiamate_oggi?.rifiuto ?? 0} rifiuti · {m?.chiamate_oggi?.no_answer ?? 0} no answer
          </div>
          <div className="text-muted-foreground">Nelle ultime 24 ore</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Appuntamenti oggi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {m ? appuntamenti : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CalendarIcon />
              Fissati
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Appuntamenti confermati <CalendarIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Da {totale} chiamate totali</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tasso successo</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {m ? `${tasso}%` : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {tassoUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {tasso}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {tassoUp ? "Buona performance" : "Da migliorare"}{" "}
            {tassoUp ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">Appuntamenti / chiamate totali</div>
        </CardFooter>
      </Card>
    </div>
  )
}
