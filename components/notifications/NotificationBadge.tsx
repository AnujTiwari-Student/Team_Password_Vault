import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { AcceptInviteModal } from '../modals/AcceptInviteModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Invitation {
  id: string;
  org_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'pending';
  expires_at: string;
  invited_by: string;
  created_at: string;
  org: {
    id: string;
    name: string;
    owner_user_id: string;
  };
  invitedBy: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export const NotificationBadge: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get('/api/invites');
      if (response.data.success) {
        setInvitations(response.data.data.invitations || []);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationClick = (invitation: Invitation): void => {
    setSelectedInvitation(invitation);
    setShowModal(true);
  };

  const handleInvitationAccepted = (): void => {
    fetchInvitations();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatExpiresAt = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'Expires soon';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {invitations.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {invitations.length}
              </span>
            )}
            {loading && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-gray-800 border-gray-700 text-white max-h-96 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2" />
              <p className="text-sm">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs mt-1">You will see organization invitations here</p>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-gray-700 bg-gray-700/30">
                <p className="text-sm font-medium text-gray-300">
                  Organization Invitations ({invitations.length})
                </p>
              </div>
              {invitations.map((invitation) => (
                <DropdownMenuItem
                  key={invitation.id}
                  onClick={() => handleInvitationClick(invitation)}
                  className="p-3 cursor-pointer hover:bg-gray-700 focus:bg-gray-700 border-b border-gray-700/50 last:border-b-0"
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="bg-blue-600 p-1.5 rounded flex-shrink-0">
                      <Bell className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {invitation.org.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Invited by {invitation.invitedBy.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          invitation.role === 'owner' 
                            ? 'bg-yellow-900/30 text-yellow-300'
                            : invitation.role === 'admin'
                            ? 'bg-blue-900/30 text-blue-300' 
                            : 'bg-gray-700/50 text-gray-400'
                        }`}>
                          {invitation.role}
                        </span>
                        <div className="text-xs text-gray-500 text-right">
                          <div>{formatTimeAgo(invitation.created_at)}</div>
                          <div className="text-yellow-400">{formatExpiresAt(invitation.expires_at)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AcceptInviteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        invitation={selectedInvitation}
        onAccepted={handleInvitationAccepted}
      />
    </>
  );
};
