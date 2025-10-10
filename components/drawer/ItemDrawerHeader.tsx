import React from 'react';
import { X } from 'lucide-react';
import { VaultItem } from '../types/ItemTypes';

interface ItemDrawerHeaderProps {
  item: VaultItem;
  onClose: () => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Login':
      return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
    case 'TOTP':
      return 'bg-green-900/50 text-green-300 border-green-700/50';
    case 'Secure Note':
      return 'bg-purple-900/50 text-purple-300 border-purple-700/50';
    default:
      return 'bg-gray-900/50 text-gray-300 border-gray-700/50';
  }
};

export const ItemDrawerHeader: React.FC<ItemDrawerHeaderProps> = ({ item, onClose }) => {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-850/80 backdrop-blur-sm">
      <div className="flex-1 min-w-0 pr-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 truncate">{item.name}</h2>
        <span className={`inline-block px-2 sm:px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(item.type)}`}>
          {item.type}
        </span>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-800/80 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group flex-shrink-0"
        title="Close"
      >
        <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      </button>
    </div>
  );
};
