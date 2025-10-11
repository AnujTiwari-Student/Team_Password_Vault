import React, { useState } from 'react';
import { AlertTriangle, Users, User, Shield } from 'lucide-react';
import { Vault, User as UserType } from '@/types/vault';

interface VaultTypeConverterProps {
  vault: Vault;
  user: UserType;
}

export const VaultTypeConverter: React.FC<VaultTypeConverterProps> = ({ vault, user }) => {
  const [showConverter, setShowConverter] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [memberCount, setMemberCount] = useState<number>(0);

  React.useEffect(() => {
    const fetchMemberCount = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/org/${vault.org_id}/members/count`);
        if (response.ok) {
          const data = await response.json();
          setMemberCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch member count:', error);
      }
    };

    if (vault.org_id) {
      fetchMemberCount();
    }
  }, [vault.org_id]);

  if (vault.type !== 'org') {
    return null;
  }

  const handleConvertToPersonal = async (): Promise<void> => {
    if (memberCount > 1) {
      alert('Please remove all members except yourself before converting to personal vault');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vault/${vault.id}/convert-to-personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Failed to convert vault');
      }
    } catch (error) {
      console.error('Error converting vault:', error);
      alert('Failed to convert vault to personal');
    } finally {
      setLoading(false);
    }
  };

  const canConvert = memberCount <= 1;

  return (
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Vault Type Conversion
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-400" />
            <div>
              <p className="font-medium text-white">Organization Vault</p>
              <p className="text-sm text-gray-400">Shared with {memberCount} member{memberCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => setShowConverter(!showConverter)}
            className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
          >
            Convert to Personal
          </button>
        </div>

        {showConverter && (
          <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-yellow-300 font-medium">Warning: Convert to Personal Vault</p>
                <p className="text-sm text-yellow-200">
                  Converting to a personal vault will remove all organization members and transfer 
                  ownership to you personally. This action cannot be undone.
                </p>
              </div>
            </div>

            {!canConvert && (
              <div className="bg-red-900/20 border border-red-700/30 rounded p-3">
                <p className="text-red-300 text-sm">
                  <strong>Cannot convert:</strong> Please remove {memberCount - 1} other member{memberCount - 1 !== 1 ? 's' : ''} 
                  from the organization before converting to personal vault.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-300 font-medium">Requirements:</p>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li className={`flex items-center gap-2 ${canConvert ? 'text-green-400' : 'text-red-400'}`}>
                  {canConvert ? '✓' : '✗'} Only you should be a member (currently: {memberCount} member{memberCount !== 1 ? 's' : ''})
                </li>
                <li className="flex items-center gap-2 text-green-400">
                  ✓ You are the organization owner
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConvertToPersonal}
                disabled={!canConvert || loading}
                className="px-4 py-2 bg-red-600/90 hover:bg-red-700/90 disabled:bg-gray-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                Convert to Personal
              </button>
              <button
                onClick={() => setShowConverter(false)}
                className="px-4 py-2 bg-gray-600/50 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
