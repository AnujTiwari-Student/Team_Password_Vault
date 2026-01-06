import { useState, useEffect } from "react";
import { bufferToBase64, deriveUMKData, unwrapKey } from "@/utils/client-crypto";

export function useUserMasterKey(mnemonic: string | null, skipIfNoSetup: boolean = false) {
  const [umkCryptoKey, setUmkCryptoKey] = useState<CryptoKey | null>(null);
  const [privateKeyBase64, setPrivateKeyBase64] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!mnemonic) {
      setUmkCryptoKey(null);
      setPrivateKeyBase64(null);
      return;
    }

    async function derive() {
      try {
        const response = await fetch('/api/user/umk-salt');
        
        if (!response.ok) {
          if (response.status === 404 && skipIfNoSetup) {
            console.log('User has not completed passphrase setup yet');
            setSetupComplete(false);
            return;
          }
          throw new Error('Failed to fetch UMK salt');
        }
        
        const { umk_salt, wrapped_private_key } = await response.json();
        
        console.log("UMK salt received:", umk_salt ? "present" : "missing");
        console.log("Wrapped private key received:", wrapped_private_key ? "present" : "missing");
        
        setSetupComplete(true);
        
        const { umkCryptoKey } = await deriveUMKData(mnemonic!, umk_salt);
        setUmkCryptoKey(umkCryptoKey);

        if (wrapped_private_key) {
          console.log("Attempting to unwrap private key...");
          console.log("Wrapped private key length:", wrapped_private_key.length);
          
          const privateKeyCrypto = await unwrapKey(wrapped_private_key, umkCryptoKey);
          
          const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", privateKeyCrypto);
          const privateKeyBase64 = bufferToBase64(privateKeyBuffer);
          setPrivateKeyBase64(privateKeyBase64);
          console.log("Private key unwrapped successfully");
        }

      } catch (error) {
        console.error('Failed to derive UMK key:', error);
        setUmkCryptoKey(null);
        setPrivateKeyBase64(null);
        setSetupComplete(false);
      }
    }

    derive();
  }, [mnemonic, skipIfNoSetup]);

  return { umkCryptoKey, privateKeyBase64, setupComplete };
}