// components/modals/AcceptInviteModal.tsx
import React, { useState } from 'react';
import { Key, Building2, Crown, Shield, Users, Check, X } from 'lucide-react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from '../auth/form-error';
import { FormSuccess } from '../auth/form-success';
import { toast } from "sonner";

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

interface AcceptInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: Invitation | null;
  onAccepted: () => void;
}

export const AcceptInviteModal: React.FC<AcceptInviteModalProps> = ({
  isOpen,
  onClose,
  invitation,
  onAccepted
}) => {
  const [masterPassphrase, setMasterPassphrase] = useState<string>('');
  const [accepting, setAccepting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAccept = async (): Promise<void> => {
    if (!invitation || !masterPassphrase.trim()) return;

    try {
      setAccepting(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post('/api/invites/accept', {
        invitation_id: invitation.id,
        master_passphrase: masterPassphrase.trim()
      });

      if (response.data.success) {
        setSuccess('Invitation accepted successfully!');
        toast.success('Welcome to the organization!');
        
        setTimeout(() => {
          onAccepted();
          handleClose();
          window.location.reload();
        }, 2000);
      } else {
        const errorMessage = response.data.errors?._form?.[0] || 'Failed to accept invitation';
        setError(errorMessage);
      }
    } catch (error) {
      let errorMessage = "Failed to accept invitation. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.errors?._form?.[0]) {
        errorMessage = error.response.data.errors._form[0];
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async (): Promise<void> => {
    if (!invitation) return;

    try {
      const response = await axios.post('/api/invites/reject', {
        invitation_id: invitation.id
      });

      if (response.data.success) {
        toast.success('Invitation rejected');
        onAccepted(); // Refresh the invitations list
        handleClose();
      }
    } catch (error) {
      toast.error('Failed to reject invitation');
    }
  };

  const handleClose = (): void => {
    setMasterPassphrase('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return Crown;
      case 'admin':
        return Shield;
      default:
        return Users;
    }
  };

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

  if (!invitation) return null;

  const RoleIcon = getRoleIcon(invitation.role);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900/95 border-gray-700/50 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Organization Invitation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invitation Details */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white mb-1">
                  {invitation.org.name}
                </h3>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">{invitation.invitedBy.name}</span> invited you to join this organization
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded ${getRoleBadgeColor(invitation.role)}`}>
                <RoleIcon className="w-3 h-3 inline mr-1" />
                {invitation.role}
              </span>
              <span className="text-xs text-gray-500">
                Expires {new Date(invitation.expires_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Role Permissions Info */}
          <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-sm font-medium text-blue-300 mb-1">
              As a {invitation.role}, you will be able to:
            </p>
            <ul className="text-xs text-blue-200 space-y-1">
              {invitation.role === 'owner' && (
                <>
                  <li>• Full control over the organization</li>
                  <li>• Manage all members and settings</li>
                  <li>• Access all vaults and resources</li>
                </>
              )}
              {invitation.role === 'admin' && (
                <>
                  <li>• Manage organization members</li>
                  <li>• Create and manage teams</li>
                  <li>• Access all organizational resources</li>
                </>
              )}
              {invitation.role === 'member' && (
                <>
                  <li>• Access assigned organizational resources</li>
                  <li>• Collaborate with team members</li>
                  <li>• View and use shared vaults</li>
                </>
              )}
              {invitation.role === 'viewer' && (
                <>
                  <li>• View organizational resources</li>
                  <li>• Read-only access to shared content</li>
                </>
              )}
            </ul>
          </div>

          {/* Master Passphrase Input */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
              <Key className="w-4 h-4" />
              Master Passphrase *
            </label>
            <Input
              type="password"
              value={masterPassphrase}
              onChange={(e) => setMasterPassphrase(e.target.value)}
              placeholder="Enter your 24-word master passphrase"
              className="bg-gray-800/50 border-gray-700/50 focus:border-gray-600 text-white font-mono text-sm"
              disabled={accepting}
            />
            <p className="text-xs text-gray-400 mt-1">
              Your master passphrase is required to securely access organization data.
            </p>
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50"
              disabled={accepting}
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-green-600/90 hover:bg-green-700/90 text-white"
              disabled={!masterPassphrase.trim() || accepting}
            >
              {accepting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Accepting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Accept
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
