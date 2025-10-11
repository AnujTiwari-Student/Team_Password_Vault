import { useState, useCallback } from 'react';
import { unwrapKey, decryptData } from '@/utils/client-crypto';

interface DecryptedData {
  username?: string;
  password?: string;
  totp_seed?: string;
  note?: string;
}

interface APIVaultItem {
  id: string;
  name: string;
  url?: string;
  type: string[];
  tags: string[];
  item_key_wrapped: string;
  username_ct?: string;
  password_ct?: string;
  totp_seed_ct?: string;
  note_ct?: string;
  updated_at: string;
}

export function useDecryption(ovkCryptoKey: CryptoKey | null) {
  const [decryptedItems, setDecryptedItems] = useState<Record<string, DecryptedData>>({});
  const [decrypting, setDecrypting] = useState<Record<string, boolean>>({});

  const decryptItem = useCallback(async (item: APIVaultItem): Promise<DecryptedData | null> => {
    if (!ovkCryptoKey || !item.item_key_wrapped) {
      return null;
    }

    try {
      setDecrypting(prev => ({ ...prev, [item.id]: true }));

      const itemKey = await unwrapKey(item.item_key_wrapped, ovkCryptoKey);
      
      const decrypted: DecryptedData = {};

      if (item.username_ct) {
        try {
          decrypted.username = await decryptData(item.username_ct, itemKey);
        } catch (error) {
          console.error('Failed to decrypt username:', error);
        }
      }

      if (item.password_ct) {
        try {
          decrypted.password = await decryptData(item.password_ct, itemKey);
        } catch (error) {
          console.error('Failed to decrypt password:', error);
        }
      }

      if (item.totp_seed_ct) {
        try {
          decrypted.totp_seed = await decryptData(item.totp_seed_ct, itemKey);
        } catch (error) {
          console.error('Failed to decrypt TOTP seed:', error);
        }
      }

      if (item.note_ct) {
        try {
          decrypted.note = await decryptData(item.note_ct, itemKey);
        } catch (error) {
          console.error('Failed to decrypt note:', error);
        }
      }

      setDecryptedItems(prev => ({ ...prev, [item.id]: decrypted }));
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    } finally {
      setDecrypting(prev => ({ ...prev, [item.id]: false }));
    }
  }, [ovkCryptoKey]);

  const getDecryptedItem = useCallback((itemId: string): DecryptedData | null => {
    return decryptedItems[itemId] || null;
  }, [decryptedItems]);

  const isDecrypting = useCallback((itemId: string): boolean => {
    return decrypting[itemId] || false;
  }, [decrypting]);

  return {
    decryptItem,
    getDecryptedItem,
    isDecrypting,
    decryptedItems
  };
}
