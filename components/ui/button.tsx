import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "ghost" | "outline" | "danger"

const variants: Record<ButtonVariant, string> = {
  default: "bg-blue-600 hover:bg-blue-500 text-white",
  ghost:   "hover:bg-slate-800 text-slate-300 hover:text-white",
  outline: "border border-slate-600 hover:bg-slate-800 text-slate-300",
  danger:  "bg-red-900/50 hover:bg-red-800 text-red-400 border border-red-800",
}

export function Button({
  variant = "default",
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
