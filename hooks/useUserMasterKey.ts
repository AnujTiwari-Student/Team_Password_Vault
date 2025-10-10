import { useState, useEffect } from "react";
import { deriveUMKData } from "@/utils/client-crypto";

export function useUserMasterKey(mnemonic: string | null) {
  const [umkCryptoKey, setUmkCryptoKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    if (!mnemonic) {
      setUmkCryptoKey(null);
      return;
    }

    async function derive() {
      try {
        const response = await fetch('/api/user/umk-salt');
        if (!response.ok) throw new Error('Failed to fetch UMK salt');
        
        const { umk_salt } = await response.json();
        
        const { umkCryptoKey } = await deriveUMKData(mnemonic!, umk_salt);
        setUmkCryptoKey(umkCryptoKey);
      } catch (error) {
        console.error('Failed to derive UMK key:', error);
        setUmkCryptoKey(null);
      }
    }

    derive();
  }, [mnemonic]);

  return { umkCryptoKey };
}
