"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const router = useRouter();
  const user = useCurrentUser();
  const { isMobile } = useSidebar();

  const [showLoading, setShowLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState(teams[0]);

  useEffect(() => {
    if (!user) {
      const timeoutId = setTimeout(() => {
        setShowLoading(true);
        router.replace("/auth/login");
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [user, router]);

  useEffect(() => {
    if (user && !user.masterPassphraseSetupComplete) {
      router.replace("/setup/master-passphrase");
    }
  }, [user, router]);

  if (!user) {
    if (showLoading) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-xl">Loading User Data...</div>
        </div>
      );
    }
    return null;
  }

  const isDisabled = !user.org;

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu className="bg-gray-900 text-white">

      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`
                transition-colors duration-150 ease-in-out
                
                data-[state=open]:bg-gray-800 data-[state=open]:text-white hover:bg-gray-800
                
                ${isDisabled ? 'hover:bg-transparent data-[state=open]:bg-transparent' : "data-[state=open]:bg-transparent"}
              `}
            >
              <div className="bg-blue-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-white">{user.org?.name ? `${user.org.name} Organization` : `${user.name} (Personal Workspace)`}
                </span>
                <span className="truncate text-xs text-gray-400">{user.org ? `${activeTeam.plan}` : `Free Plan`}</span>
              </div>
              <ChevronsUpDown className={`ml-auto text-gray-400 ${user.org ? "block" : "hidden"}`} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {user.org && (
            <DropdownMenuContent
              className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg bg-gray-800 border border-gray-700 text-white"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-gray-400 text-xs">Teams</DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2 text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border border-gray-600 bg-gray-900">
                    <team.logo className="size-3.5 shrink-0" />
                  </div>
                  <div className="text-white hover:text-white font-medium">{team.name}</div>
                  <DropdownMenuShortcut className="text-gray-400">⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="gap-2 p-2 text-white hover:bg-gray-700 focus:bg-gray-700">
                <div className="flex size-6 items-center justify-center rounded-md border border-gray-600 bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-gray-400 font-medium">Add team</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
