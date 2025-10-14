"use client";

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Trash2, 
  UserX, 
  Crown, 
  Edit3,
  MoreHorizontal,
  Search,
  Filter,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';
import { User } from '@/types/vault';
import { Team } from '@/types/team';
import { APIResponse } from '@/types/api-responses';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from '../auth/form-error';
import { FormSuccess } from '../auth/form-success';
import { toast } from "sonner";

interface OrganizationManagementProps {
  user: User;
  orgId: string;
}

interface OrganizationMember {
  id: string;
  user_id: string;
  org_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  ovk_wrapped_for_user: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  teams?: Team[];
}

interface TeamWithMembers extends Team {
  members: OrganizationMember[];
  member_count: number;
}

export const OrganizationManagement: React.FC<OrganizationManagementProps> = ({ user, orgId }) => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState<boolean>(false);
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState<boolean>(false);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'members' | 'teams'>('members');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const isOwnerOrAdmin = user?.org?.owner_user_id === user?.id || 
    members.find(m => m.user_id === user?.id)?.role === 'admin';

  useEffect(() => {
    fetchMembers();
    fetchTeams();
  }, [orgId]);

  const fetchMembers = async (): Promise<void> => {
    try {
      const response = await axios.get<APIResponse>(`/api/members?org_id=${orgId}`);
      if (response.data.success && response.data.data) {
        setMembers(response.data.data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (): Promise<void> => {
    try {
      const response = await axios.get<APIResponse>(`/api/teams?org_id=${orgId}&vault_id=${user.vault!.id}`);
      if (response.data.success && response.data.data) {
        setTeams(response.data.data.teams || []);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleRoleChange = async (newRole: string): Promise<void> => {
    if (!selectedMember) return;

    try {
      startTransition(async () => {
        setError(null);
        setSuccess(null);

        const response = await axios.patch<APIResponse>(`/api/members/${selectedMember.id}`, {
          role: newRole
        });

        if (response.data.success) {
          setSuccess(`Role updated to ${newRole} successfully!`);
          toast.success(`Role updated successfully!`);
          fetchMembers();
          setShowRoleModal(false);
          setSelectedMember(null);
        } else {
          const errorMessage = response.data.errors?._form?.[0] || 'Failed to update role';
          throw new Error(errorMessage);
        }
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to update role. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.errors?._form?.[0]) {
        errorMessage = error.response.data.errors._form[0];
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemoveMember = async (): Promise<void> => {
    if (!selectedMember) return;

    try {
      startTransition(async () => {
        setError(null);
        setSuccess(null);

        const response = await axios.delete<APIResponse>(`/api/members/${selectedMember.id}`);

        if (response.data.success) {
          setSuccess('Member removed from organization successfully!');
          toast.success('Member removed successfully!');
          fetchMembers();
          setShowRemoveMemberModal(false);
          setSelectedMember(null);
        } else {
          const errorMessage = response.data.errors?._form?.[0] || 'Failed to remove member';
          throw new Error(errorMessage);
        }
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to remove member. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.errors?._form?.[0]) {
        errorMessage = error.response.data.errors._form[0];
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteTeam = async (): Promise<void> => {
    if (!selectedTeam) return;

    try {
      startTransition(async () => {
        setError(null);
        setSuccess(null);

        const response = await axios.delete<APIResponse>(`/api/teams/${selectedTeam.id}`);

        if (response.data.success) {
          setSuccess('Team deleted successfully!');
          toast.success('Team deleted successfully!');
          fetchTeams();
          setShowDeleteTeamModal(false);
          setSelectedTeam(null);
        } else {
          const errorMessage = response.data.errors?._form?.[0] || 'Failed to delete team';
          throw new Error(errorMessage);
        }
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to delete team. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.errors?._form?.[0]) {
        errorMessage = error.response.data.errors._form[0];
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemoveFromTeam = async (teamId: string, userId: string): Promise<void> => {
    try {
      const response = await axios.delete<APIResponse>(`/api/team-members/${teamId}/${userId}`);
      if (response.data.success) {
        toast.success('Member removed from team successfully!');
        fetchTeams();
      }
    } catch (error) {
      console.error('Failed to remove member from team:', error);
      toast.error('Failed to remove member from team');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/30 border';
      case 'admin':
        return 'bg-blue-900/30 text-blue-300 border-blue-700/30 border';
      case 'member':
        return 'bg-gray-700/50 text-gray-400';
      case 'viewer':
        return 'bg-purple-900/30 text-purple-300 border-purple-700/30 border';
      default:
        return 'bg-gray-700/50 text-gray-400';
    }
  };

  if (!isOwnerOrAdmin) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
        <div className="flex items-center gap-3 text-gray-400">
          <Shield className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-yellow-300 font-medium">Access Denied</p>
            <p className="text-sm mt-1">Only organization owners and admins can manage members and teams.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700/50 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700/50 rounded"></div>
            <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Manage Organization</h2>
      </div>
      <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              Organization Management
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Manage members, teams, and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base ${
                activeTab === 'members'
                  ? 'bg-gray-600/50 text-white'
                  : 'bg-gray-700/30 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Members
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base ${
                activeTab === 'teams'
                  ? 'bg-gray-600/50 text-white'
                  : 'bg-gray-700/30 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Teams
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder={activeTab === 'members' ? 'Search members...' : 'Search teams...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700/50 focus:border-gray-600 text-white"
            />
          </div>
          {activeTab === 'members' && (
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-gray-800/50 border-gray-700/50 focus:border-gray-600 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-gray-700">All Roles</SelectItem>
                <SelectItem value="owner" className="text-white hover:bg-gray-700">Owner</SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-gray-700">Admin</SelectItem>
                <SelectItem value="member" className="text-white hover:bg-gray-700">Member</SelectItem>
                <SelectItem value="viewer" className="text-white hover:bg-gray-700">Viewer</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'members' ? (
        <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Members ({filteredMembers.length})
            </h4>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No members found</p>
              {searchTerm && (
                <p className="text-xs mt-1">Try adjusting your search or filter</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {member.user?.image ? (
                      <Image
                        src={member.user.image}
                        alt={member.user?.name || "User"}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-600/50 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.user?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {member.user?.email || "No email"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                    
                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-gray-600/50"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="bg-gray-800 border-gray-700"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member);
                              setShowRoleModal(true);
                            }}
                            className="text-white hover:bg-gray-700 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member);
                              setShowRemoveMemberModal(true);
                            }}
                            className="text-red-300 hover:bg-red-900/20 cursor-pointer"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Remove from Org
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Teams ({teams.length})
            </h4>
          </div>

          {teams.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No teams created yet</p>
              <p className="text-xs mt-1">Teams will appear here once created</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="border border-gray-600/30 rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 bg-gray-700/20">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <h5 className="font-medium text-white">{team.name}</h5>
                        <p className="text-xs text-gray-400">
                          {team.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(team.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white hover:bg-gray-600/50"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="bg-gray-800 border-gray-700"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowTeamMemberModal(true);
                            }}
                            className="text-white hover:bg-gray-700 cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Manage Members
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                            }}
                            className="text-white hover:bg-gray-700 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Team
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowDeleteTeamModal(true);
                            }}
                            className="text-red-300 hover:bg-red-900/20 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {team.members && team.members.length > 0 && (
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-medium text-gray-300 mb-2">Team Members:</p>
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 bg-gray-800/30 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-600/50 rounded-full flex items-center justify-center">
                              <Users className="w-3 h-3 text-gray-400" />
                            </div>
                            <span className="text-sm text-white">
                              {member.user?.name || 'Unknown User'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromTeam(team.id, member.user_id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 px-2"
                          >
                            <UserX className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 border-gray-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-gray-400" />
              Change Member Role
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedMember && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm font-medium text-white">
                  {selectedMember.user?.name || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedMember.user?.email || 'No email'}
                </p>
                <p className="text-xs text-gray-500">
                  Current role: <span className="text-white">{selectedMember.role}</span>
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">New Role</label>
              <Select onValueChange={handleRoleChange}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700/50 focus:border-gray-600 text-white">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="admin" className="text-white hover:bg-gray-700">
                    Admin - Can manage organization
                  </SelectItem>
                  <SelectItem value="member" className="text-white hover:bg-gray-700">
                    Member - Can access resources
                  </SelectItem>
                  <SelectItem value="viewer" className="text-white hover:bg-gray-700">
                    Viewer - Read-only access
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedMember(null);
                  setError(null);
                  setSuccess(null);
                }}
                className="flex-1 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50"
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Modal */}
      <Dialog open={showRemoveMemberModal} onOpenChange={setShowRemoveMemberModal}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 border-gray-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Remove Member
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedMember && (
              <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                <p className="text-sm font-medium text-white">
                  Are you sure you want to remove {selectedMember.user?.name || 'this member'} from the organization?
                </p>
                <p className="text-xs text-red-300 mt-1">
                  This action cannot be undone. They will lose access to all organization resources.
                </p>
              </div>
            )}

            <FormError message={error} />
            <FormSuccess message={success} />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRemoveMemberModal(false);
                  setSelectedMember(null);
                  setError(null);
                  setSuccess(null);
                }}
                className="flex-1 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveMember}
                className="flex-1 bg-red-600/90 hover:bg-red-700/90 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Removing...
                  </div>
                ) : (
                  'Remove Member'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Team Modal */}
      <Dialog open={showDeleteTeamModal} onOpenChange={setShowDeleteTeamModal}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 border-gray-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Delete Team
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedTeam && (
              <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                <p className="text-sm font-medium text-white">
                  Are you sure you want to delete the {selectedTeam.name} team?
                </p>
                <p className="text-xs text-red-300 mt-1">
                  This action cannot be undone. All team members will lose their team-specific access.
                </p>
              </div>
            )}

            <FormError message={error} />
            <FormSuccess message={success} />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteTeamModal(false);
                  setSelectedTeam(null);
                  setError(null);
                  setSuccess(null);
                }}
                className="flex-1 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTeam}
                className="flex-1 bg-red-600/90 hover:bg-red-700/90 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Team'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
