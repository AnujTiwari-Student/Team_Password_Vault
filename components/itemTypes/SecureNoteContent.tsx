import React from 'react';
import { SecureNoteItem } from '../types/ItemTypes';
import { FileText, Copy, Check } from 'lucide-react';

interface SecureNoteContentProps {
  item: SecureNoteItem;
  onCopy?: (value: string) => void;
  copied?: boolean;
}

export const SecureNoteContent: React.FC<SecureNoteContentProps> = ({ 
  item, 
  onCopy, 
  copied = false 
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm font-medium text-gray-300">
            <FileText className="w-4 h-4 mr-2" />
            Secure Note
          </label>
          {onCopy && (
            <button
              onClick={() => onCopy(item.note_ct)}
              className="p-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/80 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              title="Copy note"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400" />
              )}
            </button>
          )}
        </div>
        <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-gray-300 whitespace-pre-wrap min-h-32 max-h-64 overflow-y-auto minimal-scrollbar text-sm sm:text-base">
          {item.note_ct}
        </div>
      </div>
    </div>
  );
};
