"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/ui/nav-main"
import { NavUser } from "@/components/ui/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "./team-switcher"
import { NavProjects } from "./nav-projects"
import { useCurrentUser } from "@/hooks/useCurrentUser"

const data = {
  teams: [
    {
      name: "Design Engineering",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Workground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Audits",
          url: "#",
        },
        {
          title: "Security",
          url: "#"
        }
      ],
    },
    {
      title: "Vault Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Settings",
          url: "#",
        },
        {
          title: "Items",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({ activeTab, setActiveTab, ...props }: AppSidebarProps) {

  const user = useCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <Sidebar className="py-2" variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader className="bg-gray-900">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-gray-900">
        <NavMain items={data.navMain} activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter className="bg-gray-900">
        {/* @ts-expect-error Todo: Type missmatch */}
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}