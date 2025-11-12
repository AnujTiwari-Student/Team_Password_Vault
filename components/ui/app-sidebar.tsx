"use client";

import * as React from "react";
import {
  BellRing,
  Building,
  GalleryVerticalEnd,
  SquareTerminal,
  Vault,
} from "lucide-react";

import { NavMain } from "@/components/ui/nav-main";
import { NavUser } from "@/components/ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({
  activeTab,
  setActiveTab,
  ...props
}: AppSidebarProps) {
  const user = useCurrentUser();

  const isOrganizationMember = React.useMemo(() => {
    if (!user?.member) return false;

    const memberships = Array.isArray(user.member) ? user.member : [user.member];
    
    const hasNonOwnerMembership = memberships.some(membership => {
      return membership.role !== 'owner' && membership.org_id !== user.org?.id;
    });

    const isPersonalUser = user.account_type === 'personal';
    
    return hasNonOwnerMembership || (isPersonalUser && memberships.length > 0);
  }, [user]);

  const isOrgAccount = React.useMemo(() => {
    return user?.account_type === 'org';
  }, [user?.account_type]);

  if (!user) {
    return null;
  }

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
            url: "#",
          },
        ],
      },
      {
        title: "Vault Settings",
        url: "#",
        icon: Vault,
        items: [
          {
            title: "Settings",
            url: "#",
          },
          {
            title: "Items",
            url: "#",
          },
          ...(isOrganizationMember ? [{
            title: "Org Items",
            url: "#",
          }] : []),
        ],
      },
      // Only show Teams section for organization accounts
      ...(isOrgAccount ? [{
        title: "Teams",
        url: "#",
        icon: Building,
        items: [
          {
            title: "Members",
            url: "#",
          },
          {
            title: "Manage",
            url: "#",
          },
        ],
      }] : []),
      {
        title: "Notifications",
        url: "#",
        icon: BellRing,
        items: [
          {
            title: "Active",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar className="py-2" variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader className="bg-gray-900">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-gray-900">
        <NavMain
          items={data.navMain}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </SidebarContent>
      <SidebarFooter className="bg-gray-900">
        {/* @ts-expect-error Todo: Type missmatch */}
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
