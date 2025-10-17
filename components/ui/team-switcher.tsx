"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronsUpDown, Plus, Building2 } from "lucide-react";
import axios from "axios";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import CreateOrgForm from "../auth/CreateOrgForm";

interface Organization {
  id: string;
  name: string;
  plan: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
  isOwner: boolean;
}

const dummyOrgs: Organization[] = [
  {
    id: "1",
    name: "Acme Corp",
    plan: "Free",
    role: "owner",
    created_at: "2024-01-15T00:00:00Z",
    isOwner: true,
  },
  {
    id: "2", 
    name: "Tech Startup Inc",
    plan: "Free",
    role: "admin",
    created_at: "2024-02-20T00:00:00Z",
    isOwner: false,
  },
  {
    id: "3",
    name: "Design Agency",
    plan: "Free",
    role: "member",
    created_at: "2024-03-10T00:00:00Z",
    isOwner: false,
  }
];

export function TeamSwitcher() {
  const router = useRouter();
  const user = useCurrentUser();
  const { isMobile } = useSidebar();

  const [showLoading, setShowLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>(dummyOrgs);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  useEffect(() => {
    if (user?.id) {
      fetchOrganizations();
    }
  }, [user?.id]);

  const fetchOrganizations = async (): Promise<void> => {
    try {
      setIsLoadingOrgs(true);
      const response = await axios.get('/api/orgs/data', {
        params: { userId: user?.id }
      });
      
      if (response.data.success) {
        const orgs = response.data.data.organizations || [];
        setOrganizations(orgs);
        
        const currentOrg = orgs.find((org: Organization) => org.id === user?.org?.id) || orgs[0];
        setActiveOrg(currentOrg || null);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      setOrganizations(dummyOrgs);
      setActiveOrg(dummyOrgs[0]);
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const handleCreateOrg = (): void => {
    setIsDialogOpen(true);
  };

  const handleOrgCreated = (): void => {
    fetchOrganizations();
  };

  const handleOrgSwitch = (org: Organization): void => {
    setActiveOrg(org);
    console.log('Switched to organization:', org.name);
  };

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

  const hasOrganizations = organizations.length > 0;
  const displayName = activeOrg?.name ? `${activeOrg.name}` : `${user.name} (Personal Workspace)`;
  const displayPlan = activeOrg?.plan || 'Free Plan';

  return (
    <>
      <SidebarMenu className="bg-gray-900 text-white">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={`
                  transition-colors duration-150 ease-in-out
                  data-[state=open]:bg-gray-800 data-[state=open]:text-white hover:bg-gray-800
                  ${!hasOrganizations ? 'hover:bg-transparent data-[state=open]:bg-transparent' : "data-[state=open]:bg-transparent"}
                `}
              >
                <div className="bg-blue-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-white">
                    {displayName}
                  </span>
                  <span className="truncate text-xs text-gray-400">
                    {displayPlan}
                  </span>
                </div>
                {isLoadingOrgs ? (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                ) : (
                  <ChevronsUpDown className={`ml-auto text-gray-400 ${hasOrganizations ? "block" : "hidden"}`} />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            
            {hasOrganizations && (
              <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg bg-gray-800 border border-gray-700 text-white"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-gray-400 text-xs">Organizations</DropdownMenuLabel>
                
                <DropdownMenuItem
                  onClick={() => setActiveOrg(null)}
                  className="gap-2 p-2 text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border border-gray-600 bg-gray-900">
                    <Building2 className="size-3.5 shrink-0" />
                  </div>
                  <div className="text-white hover:text-white font-medium">Personal Workspace</div>
                  <DropdownMenuShortcut className="text-gray-400">⌘1</DropdownMenuShortcut>
                </DropdownMenuItem>

                {organizations.map((org, index) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleOrgSwitch(org)}
                    className="gap-2 p-2 text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border border-gray-600 bg-gray-900">
                      <Building2 className="size-3.5 shrink-0" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="text-white hover:text-white font-medium">{org.name}</div>
                      <div className="text-xs text-gray-400">{org.role} • {org.plan}</div>
                    </div>
                    <DropdownMenuShortcut className="text-gray-400">⌘{index + 2}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator className="bg-gray-700" />
                
                <DropdownMenuItem 
                  onClick={handleCreateOrg}
                  className="gap-2 p-2 text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border border-gray-600 bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-gray-400 font-medium">Create organization</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-white">Create Organization</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new organization to collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <CreateOrgForm 
              onSuccess={handleOrgCreated}
              onClose={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
