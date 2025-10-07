import React from 'react';
import { Copy, Eye, EyeOff, X } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  url: string;
  username: string;
  password: string;
  totp: string;
  vault: number;
}

interface ItemDrawerProps {
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;
  revealedPasswords: { [key: number]: boolean };
  togglePasswordReveal: (itemId: number) => void;
  copyToClipboard: (text: string) => void;
}

export const ItemDrawer: React.FC<ItemDrawerProps> = ({
  selectedItem,
  setSelectedItem,
  revealedPasswords,
  togglePasswordReveal,
  copyToClipboard
}) => {
  if (!selectedItem) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-800 border-l border-gray-700 shadow-2xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{selectedItem.name}</h3>
          <button
            onClick={() => setSelectedItem(null)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name, URL, Username fields */}
          {[
            { label: 'Name', value: selectedItem.name },
            { label: 'URL', value: selectedItem.url },
            { label: 'Username', value: selectedItem.username }
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
              <input
                type="text"
                value={value}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                readOnly
              />
            </div>
          ))}

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="flex gap-2">
              <input
                type={revealedPasswords[selectedItem.id] ? 'text' : 'password'}
                value={selectedItem.password}
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                readOnly
              />
              <button
                onClick={() => togglePasswordReveal(selectedItem.id)}
                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {revealedPasswords[selectedItem.id] ? (
                  <EyeOff size={18} className="text-gray-400" />
                ) : (
                  <Eye size={18} className="text-gray-400" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(selectedItem.password)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          {/* TOTP field */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-2">TOTP Code</label>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-mono font-bold text-white tracking-wider">
                {selectedItem.totp}
              </span>
              <button
                onClick={() => copyToClipboard(selectedItem.totp)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Copy size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};