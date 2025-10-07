import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  url: string;
  username: string;
  password: string;
  totp: string;
  vault: number;
}

interface Vault {
  id: number;
  name: string;
}

interface VaultItemTableProps {
  selectedVault: Vault;
  items: Item[];
  setSelectedItem: (item: Item) => void;
  setShareDialogOpen: (open: boolean) => void;
}

export const VaultItemTable: React.FC<VaultItemTableProps> = ({
  selectedVault,
  items,
  setSelectedItem,
  setShareDialogOpen
}) => {
  const filteredItems = items.filter(item => item.vault === selectedVault.id);

  const handleShareClick = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    setSelectedItem(item);
    setShareDialogOpen(true);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">{selectedVault.name}</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search items..."
              className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="p-2 bg-gray-900 border border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
            <Filter size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Name</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">URL</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Username</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 text-white font-medium">{item.name}</td>
                <td className="py-3 px-4 text-gray-400">{item.url}</td>
                <td className="py-3 px-4 text-gray-400">{item.username}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={(e) => handleShareClick(e, item)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Share
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};