import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "success" | "danger" | "warning" | "info" | "muted"

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-700 text-slate-200",
  success: "bg-green-900/50 text-green-400 border border-green-800",
  danger:  "bg-red-900/50 text-red-400 border border-red-800",
  warning: "bg-orange-900/50 text-orange-400 border border-orange-800",
  info:    "bg-blue-900/50 text-blue-400 border border-blue-800",
  muted:   "bg-slate-800 text-slate-400 border border-slate-700",
}

export function Badge({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export function esitoBadge(esito: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    appuntamento_fissato: { label: "Appuntamento", variant: "success" },
    rifiuto:              { label: "Rifiuto",       variant: "danger" },
    no_answer:            { label: "No answer",     variant: "warning" },
    script:               { label: "In corso",      variant: "info" },
  }
  const e = map[esito] ?? { label: esito, variant: "muted" as BadgeVariant }
  return <Badge variant={e.variant}>{e.label}</Badge>
}

export function statoBadge(stato: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    da_chiamare:       { label: "Da chiamare",       variant: "info" },
    appuntamento:      { label: "Appuntamento",      variant: "success" },
    rifiuto:           { label: "Rifiuto",           variant: "danger" },
    non_raggiungibile: { label: "Non raggiungibile", variant: "muted" },
  }
  const s = map[stato] ?? { label: stato, variant: "muted" as BadgeVariant }
  return <Badge variant={s.variant}>{s.label}</Badge>
}
