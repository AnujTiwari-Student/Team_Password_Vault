"use client"

import React, { useState } from 'react';
import { Mail, Search, Filter, Grid, List } from 'lucide-react';
import { copyToClipboard } from '@/utils/handle-copy';
import AddingItemsModal from '../modals/AddingItems';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { VaultItem } from '../types/ItemTypes';
import { EnhancedItemDrawer } from '../drawer/EnhancedItemDrawer';
import { PasswordField } from '../fields/PasswordField';
import { TOTPField } from '../fields/TOTPField';
import { InputField } from '../fields/InputField';

interface Vault {
  id: number;
  name: string;
  items: number;
  shared: boolean;
}

interface VaultsListProps {
  items: Vault[];
}

export const ItemList: React.FC<VaultsListProps> = ({ items }) => {
  const router = useRouter();
  const user = useCurrentUser();
  
  if (!user) {
    router.push("/auth/login");
  }

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleCopy = async (text: string, field: string): Promise<void> => {
    try {
      await copyToClipboard(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sampleItems: VaultItem[] = [
    {
      id: 'item_login_full',
      name: 'GitHub Account',
      type: 'Login',
      url: 'https://github.com/login',
      tags: ['work', 'development', 'important'],
      username_ct: 'developer@company.com',
      password_ct: 'MySecureP@ssw0rd2024!',
      totp_seed_ct: 'JBSWY3DPEHPK3PXP',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item_login_password',
      name: 'WiFi Password',
      type: 'Login',
      tags: ['home', 'network'],
      password_ct: 'WifiPassword123!',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item_totp_only',
      name: 'Google Authenticator',
      type: 'TOTP',
      tags: ['2fa', 'security'],
      totp_seed_ct: 'JBSWY3DPEHPK3PXP',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'item_note_only',
      name: 'Server Access Notes',
      type: 'Secure Note',
      tags: ['server', 'documentation'],
      note_ct: 'SSH Key location: ~/.ssh/server_key\nServer IP: 192.168.1.100\nPort: 2222\n\nRemember to backup database every Sunday.',
      updated_at: new Date().toISOString(),
    }
  ];

  const filteredItems = sampleItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDisplayUsername = (item: VaultItem): string => {
    if (item.type === 'Login' && item.username_ct) {
      return item.username_ct;
    }
    return '';
  };

  const hasTotp = (item: VaultItem): boolean => {
    return (item.type === 'Login' && !!item.totp_seed_ct) || item.type === 'TOTP';
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{user?.vault?.name || 'My Vault'}</h2>
          <p className="text-gray-400 text-sm mt-1">{filteredItems.length} items</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AddingItemsModal />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className={`relative flex-1 transition-all duration-300 ${isSearchFocused ? 'transform scale-[1.02]' : ''}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all duration-300 text-sm sm:text-base"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2.5 sm:p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? (
              <List className="w-4 h-4 text-gray-400" />
            ) : (
              <Grid className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <button className="p-2.5 sm:p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
            <Filter className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-4">Quick Access</h3>

        <InputField
          label="Username"
          icon={Mail}
          value="Anuj"
          onCopy={(val) => handleCopy(val, 'username')}
          copied={copiedField === 'username'}
        />

        <PasswordField
          value="password123"
          onCopy={(val) => handleCopy(val, 'password')}
          copied={copiedField === 'password'}
        />

        <TOTPField
          totpSeed="JBSWY3DPEHPK3PXP"
          onCopy={(val) => handleCopy(val, 'totp')}
          copied={copiedField === 'totp'}
        />
      </div>

      <div className={`grid gap-3 sm:gap-4 ${
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
          : 'grid-cols-1'
      }`}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedItem(item);
              setIsItemDrawerOpen(true);
            }}
            className="group bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/80 border border-gray-700/50 hover:border-gray-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-base sm:text-lg group-hover:text-blue-300 transition-colors truncate">
                  {item.name}
                </h4>
                {getDisplayUsername(item) && (
                  <p className="text-gray-400 text-xs sm:text-sm mt-1 truncate">{getDisplayUsername(item)}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 ml-2">
                {item.type && (
                  <span className="px-2 py-0.5 sm:py-1 bg-blue-900/50 text-blue-300 text-xs rounded-md sm:rounded-lg border border-blue-700/50 whitespace-nowrap">
                    {item.type}
                  </span>
                )}
                {hasTotp(item) && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="2FA Enabled" />
                )}
              </div>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gray-700/50 text-gray-300 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded-md">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Updated {new Date(item.updated_at || '').toLocaleDateString()}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-blue-400 whitespace-nowrap">View details →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EnhancedItemDrawer
        isOpen={isItemDrawerOpen}
        onClose={() => setIsItemDrawerOpen(false)}
        item={selectedItem}
        onEdit={() => console.log('Edit clicked')}
      />
    </div>
  );
};
