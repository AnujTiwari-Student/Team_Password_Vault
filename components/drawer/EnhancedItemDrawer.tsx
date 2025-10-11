"use client"

import React, { useState, useEffect } from 'react';
import { X, User, Lock, Shield, FileText, ExternalLink, Eye, EyeOff, Edit, Copy, BookCopy } from 'lucide-react';
import { APIVaultItem, DecryptedData, MemberRole } from '@/types/vault';

interface EnhancedItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: APIVaultItem | null;
  decryptedData?: DecryptedData | null;
  userRole: MemberRole | null;
  canDecrypt: boolean;
  canEdit: boolean;
  onCopyEncrypted: (value: string, field: string) => void;
  onEdit?: () => void;
}

export const EnhancedItemDrawer: React.FC<EnhancedItemDrawerProps> = ({ 
  isOpen, 
  onClose, 
  item, 
  decryptedData,
  userRole,
  canDecrypt,
  canEdit,
  onCopyEncrypted,
  onEdit 
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

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

  const getTypeColor = (types: string[]): string => {
    if (types.length === 1) {
      switch (types[0]) {
        case 'login':
          return 'bg-blue-900/30 text-blue-300 border-blue-700/30';
        case 'note':
          return 'bg-purple-900/30 text-purple-300 border-purple-700/30';
        case 'totp':
          return 'bg-green-900/30 text-green-300 border-green-700/30';
        default:
          return 'bg-gray-900/30 text-gray-300 border-gray-700/30';
      }
    }
    return 'bg-gradient-to-r from-blue-900/30 to-green-900/30 text-white border-blue-700/30';
  };

  const getRoleBadgeColor = (role: MemberRole | null): string => {
    switch (role) {
      case 'owner': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/30';
      case 'admin': return 'bg-blue-900/30 text-blue-300 border-blue-700/30';
      case 'member': return 'bg-green-900/30 text-green-300 border-green-700/30';
      case 'viewer': return 'bg-gray-900/30 text-gray-300 border-gray-700/30';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-700/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/30 bg-gray-800/30 backdrop-blur-sm">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 truncate">{item.name}</h2>
            <div className="flex flex-wrap gap-1 items-center">
              {item.type.map((type: string, index: number) => (
                <span 
                  key={index}
                  className={`inline-block px-2 sm:px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor([type])}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              ))}
              <span className={`px-2 py-0.5 rounded text-xs border ${getRoleBadgeColor(userRole)}`}>
                {userRole}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group flex-shrink-0"
            title="Close"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto minimal-scrollbar p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-900/50 backdrop-blur-sm">
          
          {!canDecrypt && (
            <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <h3 className="text-gray-300 font-medium text-sm">View-Only Access</h3>
              </div>
              <p className="text-gray-400 text-sm">
                You can view metadata and copy encrypted values, but cannot decrypt sensitive data. 
                Contact vault owner for decrypted values if needed.
              </p>
            </div>
          )}

          {item.url && (
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <ExternalLink className="w-4 h-4 mr-2" />
                Website URL
              </label>
              <div className="flex items-center gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl text-gray-300 hover:text-gray-200 hover:bg-gray-700/50 transition-all duration-200 truncate hover:scale-[1.01] text-sm sm:text-base"
                >
                  {item.url}
                </a>
                <button
                  onClick={() => handleCopy(item.url!, 'url')}
                  className="p-2.5 sm:p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Copy URL"
                  type="button"
                >
                  {copiedField === 'url' ? '✓' : <BookCopy size={22} />}
                </button>
              </div>
            </div>
          )}

          {item.username_ct && (
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <User className="w-4 h-4 mr-2" />
                Username/Email
                {!canDecrypt && <span className="ml-1 text-xs text-gray-500">(Encrypted)</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={
                    canDecrypt 
                      ? (decryptedData?.username || '[Enter master passphrase to decrypt]')
                      : '[Encrypted - contact vault owner to decrypt]'
                  }
                  readOnly
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl text-white focus:outline-none text-sm sm:text-base cursor-pointer"
                  onClick={() => handleCopy(
                    canDecrypt 
                      ? (decryptedData?.username || item.username_ct!)
                      : item.username_ct!, 
                    'username'
                  )}
                />
                <button
                  onClick={() => handleCopy(
                    canDecrypt 
                      ? (decryptedData?.username || item.username_ct!)
                      : item.username_ct!, 
                    'username'
                  )}
                  className="p-2.5 sm:p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  title={canDecrypt ? "Copy username" : "Copy encrypted username"}
                  type="button"
                >
                  {copiedField === 'username' ? '✓' : <BookCopy size={22} />}
                </button>
                {!canDecrypt && (
                  <button
                    onClick={() => onCopyEncrypted(item.username_ct!, 'username_encrypted')}
                    className="p-2.5 sm:p-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:bg-gray-600/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Copy encrypted value"
                    type="button"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {item.password_ct && (
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <Lock className="w-4 h-4 mr-2" />
                Password
                {!canDecrypt && <span className="ml-1 text-xs text-gray-500">(Encrypted)</span>}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={
                      canDecrypt 
                        ? (decryptedData?.password || '[Enter master passphrase to decrypt]')
                        : '[Encrypted - contact vault owner to decrypt]'
                    }
                    readOnly
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl text-white focus:outline-none text-sm sm:text-base cursor-pointer font-mono pr-10"
                    onClick={() => handleCopy(
                      canDecrypt 
                        ? (decryptedData?.password || item.password_ct!)
                        : item.password_ct!, 
                      'password'
                    )}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700/30 rounded transition-colors"
                    title={showPassword ? "Hide" : "Show"}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                <button
                  onClick={() => handleCopy(
                    canDecrypt 
                      ? (decryptedData?.password || item.password_ct!)
                      : item.password_ct!, 
                    'password'
                  )}
                  className="p-2.5 sm:p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  title={canDecrypt ? "Copy password" : "Copy encrypted password"}
                  type="button"
                >
                  {copiedField === 'password' ? '✓' : <BookCopy size={22} />}
                </button>
                {!canDecrypt && (
                  <button
                    onClick={() => onCopyEncrypted(item.password_ct!, 'password_encrypted')}
                    className="p-2.5 sm:p-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:bg-gray-600/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Copy encrypted value"
                    type="button"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {item.totp_seed_ct && (
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <Shield className="w-4 h-4 mr-2" />
                TOTP Secret
                {!canDecrypt && <span className="ml-1 text-xs text-gray-500">(Encrypted)</span>}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-green-300 font-mono text-sm cursor-pointer"
                      onClick={() => handleCopy(
                        canDecrypt 
                          ? (decryptedData?.totp_seed || item.totp_seed_ct!)
                          : item.totp_seed_ct!, 
                        'totp'
                      )}
                    >
                      {canDecrypt 
                        ? (decryptedData?.totp_seed || '[Enter master passphrase to decrypt]')
                        : '[Encrypted - contact vault owner to decrypt]'
                      }
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(
                    canDecrypt 
                      ? (decryptedData?.totp_seed || item.totp_seed_ct!)
                      : item.totp_seed_ct!, 
                    'totp'
                  )}
                  className="p-2.5 sm:p-3 bg-green-800/50 backdrop-blur-sm border border-green-700/30 hover:bg-green-700/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  title={canDecrypt ? "Copy TOTP secret" : "Copy encrypted TOTP secret"}
                  type="button"
                >
                  {copiedField === 'totp' ? '✓' : <BookCopy size={22} />}
                </button>
                {!canDecrypt && (
                  <button
                    onClick={() => onCopyEncrypted(item.totp_seed_ct!, 'totp_encrypted')}
                    className="p-2.5 sm:p-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:bg-gray-600/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Copy encrypted value"
                    type="button"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {item.note_ct && (
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                <FileText className="w-4 h-4 mr-2" />
                Secure Note
                {!canDecrypt && <span className="ml-1 text-xs text-gray-500">(Encrypted)</span>}
              </label>
              <div className="px-3 sm:px-4 py-3 sm:py-4 bg-purple-900/10 backdrop-blur-sm border border-purple-700/30 rounded-xl text-purple-300 text-sm sm:text-base cursor-pointer hover:bg-purple-900/20 transition-colors"
                onClick={() => handleCopy(
                  canDecrypt 
                    ? (decryptedData?.note || item.note_ct!)
                    : item.note_ct!, 
                  'note'
                )}
              >
                <p className="whitespace-pre-wrap">
                  {canDecrypt 
                    ? (decryptedData?.note || '[Enter master passphrase to decrypt]')
                    : '[Encrypted - contact vault owner to decrypt]'
                  }
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleCopy(
                    canDecrypt 
                      ? (decryptedData?.note || item.note_ct!)
                      : item.note_ct!, 
                    'note'
                  )}
                  className="text-xs bg-purple-800/50 hover:bg-purple-700/50 px-3 py-1 rounded-lg transition-colors"
                  type="button"
                >
                  {copiedField === 'note' ? 'Copied!' : 'Copy'}
                </button>
                {!canDecrypt && (
                  <button
                    onClick={() => onCopyEncrypted(item.note_ct!, 'note_encrypted')}
                    className="text-xs bg-gray-700/50 hover:bg-gray-600/50 px-3 py-1 rounded-lg transition-colors"
                    type="button"
                  >
                    Copy Encrypted
                  </button>
                )}
              </div>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-300">
                🏷️ Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-sm rounded-full border backdrop-blur-sm transition-all hover:scale-105 bg-gray-700/30 text-gray-300 border-gray-600/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-700/30">
            <div className="grid grid-cols-1 gap-2 sm:gap-3 text-xs text-gray-500">
              <div className="flex justify-between items-center">
                <span>Item ID:</span>
                <span className="font-mono text-gray-400 text-right break-all">{item.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Updated:</span>
                <span className="text-gray-400">{new Date(item.updated_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Item Types:</span>
                <span className="text-gray-400">{item.type.length} type{item.type.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Access Level:</span>
                <span className={`text-sm ${canDecrypt ? 'text-green-400' : 'text-gray-400'}`}>
                  {canDecrypt ? 'Full Access' : 'View Only'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-700/30 bg-gray-800/20 backdrop-blur-sm">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 active:scale-95"
              type="button"
            >
              <X className="w-4 h-4" />
              Close
            </button>
            {canEdit && onEdit && (
              <button 
                onClick={onEdit}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700/50 backdrop-blur-sm border border-gray-600/30 text-white rounded-xl hover:bg-gray-600/50 transition-all duration-200 hover:scale-105 active:scale-95"
                type="button"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          
          <div className="mt-3 p-3 bg-gray-800/20 border border-gray-700/30 rounded-lg">
            <p className="text-gray-400 text-xs">
              <strong>Note:</strong> {
                canDecrypt 
                  ? (decryptedData ? "Data has been decrypted and is ready to use." : "Enter your master passphrase above to decrypt and view sensitive data.")
                  : "You have view-only access. You can copy encrypted values but cannot decrypt them."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
