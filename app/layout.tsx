import type { Metadata } from "next"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: "Sofia AI — Dashboard",
  description: "Outbound voice system monitor",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="it" className="dark" suppressHydrationWarning>
      <body>
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
