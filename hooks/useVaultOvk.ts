import axios, { AxiosError } from "axios";
import { unwrapKey } from "@/utils/client-crypto";
import { useState, useEffect } from "react";

type VaultType = "org" | "personal" | undefined;

interface VaultResponse {
  ovk_cipher: string;
}

export function useVaultOVK(
  umkCryptoKey: CryptoKey | null,
  id: string | null,
  vaultType: VaultType
) {
  const [ovkCryptoKey, setOvkCryptoKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    if (!id || !umkCryptoKey || !vaultType) {
      setOvkCryptoKey(null);
      return;
    }

    async function fetchAndUnwrap(): Promise<void> {
      try {
        console.log(`🔍 Fetching ${vaultType} vault key for id: ${id}`);

        const response = await axios.get<VaultResponse>(
          `/api/vaults/${vaultType}`,
          {
            params: { id },
          }
        );

        const { ovk_cipher } = response.data;
        if (!ovk_cipher) {
          throw new Error("OVK cipher missing in response");
        }

        const unwrappedKey = await unwrapKey(ovk_cipher, umkCryptoKey!);
        setOvkCryptoKey(unwrappedKey);

        console.log("✅ OVK successfully unwrapped");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{
            error?: string;
            status?: number;
          }>;
          const errorMsg =
            axiosError.response?.data?.error ?? "No error message from server";
          console.error(
            `💥 Failed to fetch OVK (${axiosError.response?.status}): ${errorMsg}`
          );
        } else {
          const err = error as Error;
          console.error(`❌ Error during OVK unwrapping:`, err.message, err);
        }

        setOvkCryptoKey(null);
      }
    }

    fetchAndUnwrap();
  }, [id, vaultType, umkCryptoKey]);

  return ovkCryptoKey;
}
