"use client"

import * as React from "react"
import {
  LayoutDashboardIcon,
  UsersIcon,
  PhoneIcon,
  CalendarIcon,
  BarChart3Icon,
  BotIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Coreflow",
    email: "admin@coreflow.it",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Contatti",
      url: "/contacts",
      icon: <UsersIcon />,
    },
    {
      title: "Chiamate",
      url: "/calls",
      icon: <PhoneIcon />,
    },
    {
      title: "Appuntamenti",
      url: "/appointments",
      icon: <CalendarIcon />,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: <BarChart3Icon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="/" />} className="data-[slot=sidebar-menu-button]:!p-1.5">
              <BotIcon className="size-5" />
              <span className="text-base font-semibold">Sofia AI</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
