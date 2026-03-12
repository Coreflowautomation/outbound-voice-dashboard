"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  totale: {
    label: "Chiamate",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface DayData { giorno: string; totale: number }

export function ChartAreaInteractive() {
  const [data, setData]     = React.useState<DayData[]>([])
  const [giorni, setGiorni] = React.useState("7")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/calls-per-day?giorni=${giorni}`)
      .then(r => r.json())
      .then(d => setData(Array.isArray(d) ? d : d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [giorni])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chiamate per giorno</CardTitle>
        <CardDescription>
          Andamento chiamate negli ultimi {giorni} giorni
        </CardDescription>
        <CardAction>
          <Select value={giorni} onValueChange={(v) => v && setGiorni(v)}>
            <SelectTrigger className="w-40" aria-label="Periodo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ultimi 7 giorni</SelectItem>
              <SelectItem value="14">Ultimi 14 giorni</SelectItem>
              <SelectItem value="30">Ultimi 30 giorni</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="h-[250px] w-full animate-pulse rounded-md bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Nessun dato disponibile
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillTotale" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-totale)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-totale)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="giorno"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return d.toLocaleDateString("it-IT", { month: "short", day: "numeric" })
                }}
              />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={28} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString("it-IT", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="totale"
                type="natural"
                fill="url(#fillTotale)"
                stroke="var(--color-totale)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
