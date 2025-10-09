import * as bip39 from "bip39";

const PBKDF2_ITERATIONS = 100000;
const AES_GCM_KEY_LENGTH = 256;
const VERIFIER_LENGTH_BYTES = 32;

const UMK_SALT_BYTES = 32;

interface UMKData {
  umk_salt: string;
  master_passphrase_verifier: string;
  umkCryptoKey: CryptoKey;
}

export const generateMnemonicPassphrase = (): string => {
  return bip39.generateMnemonic(256);
};

// In your utils/client-crypto.ts
export const generateRandomBytes = (length: number): Uint8Array => {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(length));
  }
  throw new Error("Secure random number generation is not supported.");
};

export const bufferToBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const deriveUMKData = async (masterKey: string): Promise<UMKData> => {
  const saltBuffer = new Uint8Array(UMK_SALT_BYTES);
  window.crypto.getRandomValues(saltBuffer);
  const umk_salt = btoa(String.fromCharCode(...saltBuffer));

  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(masterKey),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const umkCryptoKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: AES_GCM_KEY_LENGTH },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );

  const exportedKey = await window.crypto.subtle.exportKey("raw", umkCryptoKey);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", exportedKey);

  const master_passphrase_verifier = bufferToBase64(
    hashBuffer.slice(0, VERIFIER_LENGTH_BYTES)
  );

  return {
    umk_salt,
    master_passphrase_verifier,
    umkCryptoKey,
  };
};

export const wrapKey = async (keyToWrap: string, wrappingKey: CryptoKey): Promise<string> => {
  const keyBuffer = base64ToArrayBuffer(keyToWrap);

  const iv = new Uint8Array(generateRandomBytes(12));
  
  const wrappedKeyBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv }, 
    wrappingKey,
    keyBuffer
  );

  const combined = new Uint8Array(iv.byteLength + wrappedKeyBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(wrappedKeyBuffer), iv.byteLength);

  return bufferToBase64(combined.buffer);
};

export const unwrapKey = async (
  wrappedKeyBase64: string,
  wrappingKey: CryptoKey
): Promise<CryptoKey> => {
  const wrappedKeyWithIv = base64ToArrayBuffer(wrappedKeyBase64);
  const wrappedKeyView = new Uint8Array(wrappedKeyWithIv);
  const iv = wrappedKeyView.slice(0, 12);
  const wrappedKey = wrappedKeyView.slice(12);

  const decryptedKeyBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    wrappingKey,
    wrappedKey
  );

  const unwrappedKey = await crypto.subtle.importKey(
    "raw",
    decryptedKeyBuffer,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );

  return unwrappedKey;
};


