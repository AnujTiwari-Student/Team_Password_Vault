import React from 'react';
import { Lock, Users } from 'lucide-react';
import AddingItemsModal from '../modals/AddingItems';

interface Vault {
  id: number;
  name: string;
  items: number;
  shared: boolean;
}

interface VaultsListProps {
  vaults: Vault[];
  setSelectedVault: (vault: Vault | null) => void;
}

export const VaultsList: React.FC<VaultsListProps> = ({ vaults, setSelectedVault }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Items</h2>
        <AddingItemsModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vaults.map(vault => (
          <div
            key={vault.id}
            onClick={() => setSelectedVault(vault)}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <Lock className="text-blue-400" size={24} />
              {vault.shared && <Users className="text-green-400" size={18} />}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{vault.name}</h3>
            <p className="text-gray-400 text-sm">{vault.items} items</p>
          </div>
        ))}
      </div>
    </div>
  );
};