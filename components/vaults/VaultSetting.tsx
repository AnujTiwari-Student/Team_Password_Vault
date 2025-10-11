import { useCurrentUser } from '@/hooks/useCurrentUser';
import React, { useState } from 'react'
import { User } from '@/types/vault';
import { Settings, CreditCard, Users, Database } from 'lucide-react';
import { VaultNameEditor } from '../settings/VaultNameEditor';
import { VaultTypeConverter } from '../settings/VaultTypeConverter';
import { BillingComponent } from '../settings/BillingComponent';
import { VaultLimitsDisplay } from '../settings/VaultLimitDisplay';

function VaultSetting() {
  const user = useCurrentUser() as User | null;
  const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'limits' | 'members'>('general');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-2 text-gray-400">Loading...</span>
      </div>
    );
  }

  const vault = user.vault;
  if (!vault) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">No vault found</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-4 md:space-y-6 p-3 md:p-4 lg:p-6 min-h-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 border-b border-gray-700/50 pb-4">
          <div className="min-w-0 flex-shrink">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">{vault.name} Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your vault configuration and billing</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs border flex-shrink-0 ${
            vault.type === 'personal' 
              ? 'bg-blue-900/30 text-blue-300 border-blue-700/30'
              : 'bg-purple-900/30 text-purple-300 border-purple-700/30'
          }`}>
            {vault.type === 'personal' ? 'Personal' : 'Organization'}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-gray-800/30 p-2 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'general' 
                ? 'bg-gray-700/50 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm md:text-base">General</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'billing' 
                ? 'bg-gray-700/50 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-sm md:text-base">Billing</span>
          </button>
          <button
            onClick={() => setActiveTab('limits')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'limits' 
                ? 'bg-gray-700/50 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="text-sm md:text-base">Usage</span>
          </button>
          {vault.type === 'org' && (
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'members' 
                  ? 'bg-gray-700/50 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm md:text-base">Members</span>
            </button>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-4 md:space-y-6">
              <VaultNameEditor vault={vault} />
              <VaultTypeConverter vault={vault} user={user} />
            </div>
          )}

          {activeTab === 'billing' && (
            <BillingComponent user={user} />
          )}

          {activeTab === 'limits' && (
            <VaultLimitsDisplay user={user} vault={vault} />
          )}

          {activeTab === 'members' && vault.type === 'org' && (
            <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Organization Members</h3>
              <p className="text-gray-400 text-sm md:text-base">Member management coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VaultSetting;
