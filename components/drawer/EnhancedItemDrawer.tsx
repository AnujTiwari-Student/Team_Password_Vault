"use client"

import React, { useState, useEffect } from 'react';
import { VaultItem } from '../types/ItemTypes';
import { LoginItemContent } from '../itemTypes/LoginItemContent';
import { TOTPItemContent } from '../itemTypes/TOTPItemContent';
import { SecureNoteContent } from '../itemTypes/SecureNoteContent';
import { TagsDisplay } from '../fields/TagsDisplay';
import { ItemDrawerHeader } from './ItemDrawerHeader';
import { ItemDrawerFooter } from './ItemDrawerFooter';

interface EnhancedItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: VaultItem | null;
  onEdit?: () => void;
}

export const EnhancedItemDrawer: React.FC<EnhancedItemDrawerProps> = ({ 
  isOpen, 
  onClose, 
  item, 
  onEdit 
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopy = async (text: string, field: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen || !item) return null;

  const renderContent = () => {
    switch (item.type) {
      case 'Login':
        return (
          <LoginItemContent 
            item={item} 
            copiedField={copiedField} 
            handleCopy={handleCopy} 
          />
        );
      case 'TOTP':
        return (
          <TOTPItemContent 
            item={item} 
            copiedField={copiedField} 
            handleCopy={handleCopy} 
          />
        );
      case 'Secure Note':
        return <SecureNoteContent item={item} />;
      default:
        const _exhaustiveCheck: never = item;
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
        }}
      />
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
        
        <ItemDrawerHeader item={item} onClose={onClose} />

        <div className="flex-1 overflow-y-auto minimal-scrollbar p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-900/80 backdrop-blur-sm">
          {renderContent()}
          
          <TagsDisplay tags={item.tags} />

          <div className="pt-4 border-t border-gray-700/50">
            <div className="grid grid-cols-1 gap-2 sm:gap-3 text-xs text-gray-500">
              <div className="flex justify-between items-center">
                <span>Item ID:</span>
                <span className="font-mono text-gray-400 text-right break-all">{item.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Updated:</span>
                <span className="text-gray-400">{new Date(item.updated_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <ItemDrawerFooter onClose={onClose} onEdit={onEdit} />
      </div>
    </div>
  );
};
