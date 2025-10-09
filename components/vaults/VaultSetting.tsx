

import { useCurrentUser } from '@/hooks/useCurrentUser';
import React from 'react'

function VaultSetting() {

    const user = useCurrentUser();

    if (!user) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-xl">Loading User Data...</div>
        </div>
      );
    }



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{user.vault.name} Settings</h2>
      </div>

      
    </div>
  )
}

export default VaultSetting
