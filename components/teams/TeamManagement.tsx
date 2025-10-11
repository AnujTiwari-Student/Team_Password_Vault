import React, { useState, useEffect } from 'react';
import { Users, Plus, UserPlus } from 'lucide-react';
import axios from 'axios';
import { Vault, User } from '@/types/vault';
import { Team } from '@/types/team';
import { APIResponse } from '@/types/api-responses';
import { CreateTeamModal } from './CreateTeamModal';
import { AddMemberModal } from './AddMemberModal';
import { TeamCard } from './TeamCard';
import Image from 'next/image';

interface TeamManagementProps {
  vault: Vault;
  user: User;
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
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ vault, user }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateTeam, setShowCreateTeam] = useState<boolean>(false);
  const [showAddMember, setShowAddMember] = useState<boolean>(false);

  useEffect(() => {
    fetchTeams();
    fetchOrgMembers();
  }, [vault.id]);

  const fetchTeams = async (): Promise<void> => {
    try {
      const response = await axios.get<APIResponse>(`/api/teams?org_id=${vault.org_id}&vault_id=${vault.id}`);
      if (response.data.success && response.data.data) {
        setTeams(response.data.data.teams || []);
        if (response.data.data.teams?.length > 0) {
          setSelectedTeam(response.data.data.teams[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgMembers = async (): Promise<void> => {
    if (!user.org?.id) return;
    
    try {
      const response = await axios.get<APIResponse>(`/api/members?org_id=${user.org.id}`);
      if (response.data.success && response.data.data) {
        setOrgMembers(response.data.data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch organization members:', error);
    }
  };

  const handleTeamCreated = (newTeam: Team): void => {
    setTeams(prev => [...prev, newTeam]);
    setSelectedTeam(newTeam);
    setShowCreateTeam(false);
  };

  const handleMemberAdded = (): void => {
    fetchOrgMembers();
    setShowAddMember(false);
  };

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
      <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              Team Management - {vault.name}
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Organize access to this vault by teams
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateTeam(true)}
              className="px-3 md:px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>
            <button
              onClick={() => setShowAddMember(true)}
              className="px-3 md:px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm md:text-base">No teams created for this vault yet</p>
            <p className="text-xs md:text-sm mt-1">Create a team to organize vault access</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isSelected={selectedTeam?.id === team.id}
                onClick={() => setSelectedTeam(team)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
        <h4 className="text-lg md:text-xl font-semibold text-white mb-4">
          Organization Members ({orgMembers.length})
        </h4>

        {orgMembers.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p className="text-sm">No members in this organization yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orgMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {member.user.image ? (
                    <Image
                      src={member.user.image}
                      alt={member.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600/50 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{member.user.name}</p>
                    <p className="text-xs text-gray-400">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    member.role === 'owner' 
                      ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/30 border' 
                      : member.role === 'admin'
                      ? 'bg-blue-900/30 text-blue-300 border-blue-700/30 border'
                      : 'bg-gray-700/50 text-gray-400'
                  }`}>
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onTeamCreated={handleTeamCreated}
        orgId={vault.org_id!}
        vaultId={vault.id}
      />

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onMemberAdded={handleMemberAdded}
        orgId={vault.org_id!}
      />
    </div>
  );
};
