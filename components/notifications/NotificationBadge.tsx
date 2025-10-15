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

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async (): Promise<void> => {
    try {
      const response = await axios.get('/api/invitations');
      if (response.data.success) {
        setInvitations(response.data.data.invitations || []);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const handleInvitationClick = (invitation: Invitation): void => {
    setSelectedInvitation(invitation);
    setShowModal(true);
  };

  const handleInvitationAccepted = (): void => {
    fetchInvitations(); // Refresh invitations
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
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-gray-800 border-gray-700 text-white"
        >
          {invitations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-gray-700">
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
                    <div className="bg-blue-600 p-1.5 rounded">
                      <Bell className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {invitation.org.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Invited by {invitation.invitedBy.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Role: {invitation.role}
                      </p>
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
