import axios, { AxiosError } from "axios";
import { unwrapKey } from "@/utils/client-crypto";
import { useState, useEffect } from "react";

type VaultType = "org" | "personal" | undefined;

interface OrgVaultResponse {
  ovk_wrapped_for_user: string;
}

interface PersonalVaultResponse {
  ovk_cipher: string;
}

export function useVaultOVK(
  umkCryptoKey: CryptoKey | null,
  id: string | null,
  vaultType: VaultType,
  privateKeyBase64?: string | null
) {
  const [ovkCryptoKey, setOvkCryptoKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    if (!id || !umkCryptoKey || !vaultType) {
      setOvkCryptoKey(null);
      return;
    }

    async function fetchAndUnwrap(): Promise<void> {
      try {
        if (vaultType === "org") {
          const response = await axios.get<OrgVaultResponse>(`/api/vaults/org`, {
            params: { id },
          });

          const { ovk_wrapped_for_user } = response.data;
          
          if (!ovk_wrapped_for_user) throw new Error("OVK wrapped for user missing in response");
          
          if (!privateKeyBase64) throw new Error("Private key required for org vault");

          const unwrappedKey = await unwrapKey(ovk_wrapped_for_user, privateKeyBase64);
          setOvkCryptoKey(unwrappedKey);

        } else {
          const response = await axios.get<PersonalVaultResponse>(`/api/vaults/personal`, {
            params: { id },
          });

          const { ovk_cipher } = response.data;
          if (!ovk_cipher) throw new Error("OVK cipher missing in response");

          const unwrappedKey = await unwrapKey(ovk_cipher, umkCryptoKey!);
          setOvkCryptoKey(unwrappedKey);
        }

      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{
            error?: string;
            status?: number;
          }>;
          const errorMsg =
            axiosError.response?.data?.error ?? "No error message from server";
          console.error(
            `Failed to fetch OVK (${axiosError.response?.status}): ${errorMsg}`
          );
        } else {
          const err = error as Error;
          console.error(`Error during OVK unwrapping:`, err.message, err);
        }
        setOvkCryptoKey(null);
      }
    }

    fetchAndUnwrap();
  }, [id, vaultType, umkCryptoKey, privateKeyBase64]);

  return ovkCryptoKey;
}
