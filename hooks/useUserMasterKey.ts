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
      const { umkCryptoKey } = await deriveUMKData(mnemonic!);
      setUmkCryptoKey(umkCryptoKey);
    }

    derive();
  }, [mnemonic]);

  return { umkCryptoKey };
}
