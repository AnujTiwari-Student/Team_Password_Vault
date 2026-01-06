import axios, { AxiosError } from 'axios';
import { unwrapKey } from '@/utils/client-crypto';
import { useState, useEffect } from 'react';

type VaultType = 'org' | 'personal' | undefined;

interface OrgVaultResponse {
  ovk_wrapped_for_user: string;
  wrap_type: 'aes' | 'rsa';
  org_id: string;
}

interface PersonalVaultResponse {
  ovk_cipher: string;
}

export function useVaultOVK(
  umkCryptoKey: CryptoKey | null,
  id: string | null,
  vaultType: VaultType,
  privateKeyBase64?: string | null,
  orgId?: string | null
) {
  const [ovkCryptoKey, setOvkCryptoKey] = useState<CryptoKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !umkCryptoKey || !vaultType) {
      setOvkCryptoKey(null);
      setError(null);
      return;
    }

    async function fetchAndUnwrap(): Promise<void> {
      try {
        setError(null);

        if (vaultType === 'org') {
          if (!orgId) {
            throw new Error('Organization ID required for org vault');
          }

          const response = await axios.get<OrgVaultResponse>(`/api/vaults/org`, {
            params: { id, org_id: orgId },
          });

          const { ovk_wrapped_for_user, wrap_type } = response.data;
          
          if (!ovk_wrapped_for_user) {
            throw new Error('OVK wrapped for user missing in response');
          }

          let unwrappedKey: CryptoKey;

          if (wrap_type === 'rsa') {
            if (!privateKeyBase64) {
              throw new Error('Private key required for RSA unwrapping');
            }
            unwrappedKey = await unwrapKey(ovk_wrapped_for_user, privateKeyBase64);
          } else {
            if (!umkCryptoKey) {
              throw new Error('UMK required for AES unwrapping');
            }
            unwrappedKey = await unwrapKey(ovk_wrapped_for_user, umkCryptoKey);
          }

          setOvkCryptoKey(unwrappedKey);

        } else if (vaultType === 'personal') {

          const response = await axios.get<PersonalVaultResponse>(`/api/vaults/personal`, {
            params: { id },
          });

          const { ovk_cipher } = response.data;
          if (!ovk_cipher) {
            throw new Error('OVK cipher missing in response');
          }

          if (!umkCryptoKey) {
            throw new Error('UMK required for personal vault unwrapping');
          }

          const unwrappedKey = await unwrapKey(ovk_cipher, umkCryptoKey);
          setOvkCryptoKey(unwrappedKey);
        } else {
          throw new Error(`Invalid vault type: ${vaultType}`);
        }

      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{
            error?: string;
            message?: string;
            status?: number;
          }>;
          
          const errorMsg = 
            axiosError.response?.data?.error || 
            axiosError.response?.data?.message || 
            axiosError.message ||
            'No error message from server';
          
          setError(errorMsg);
        } else {
          const err = error as Error;
          setError(err.message);
        }
        setOvkCryptoKey(null);
      }
    }

    fetchAndUnwrap();
  }, [id, vaultType, umkCryptoKey, privateKeyBase64, orgId]);

  return { ovkCryptoKey, error };
}
