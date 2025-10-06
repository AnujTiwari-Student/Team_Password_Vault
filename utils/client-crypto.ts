import { webcrypto } from "crypto";
import * as bip39 from "bip39"; 

const PBKDF2_ITERATIONS = 100000;
const AES_GCM_KEY_LENGTH = 256;
const IV_LENGTH_BYTES = 12;
const SALT_LENGTH_BYTES = 16;
const VERIFIER_LENGTH_BYTES = 32;

const UMK_SALT_BYTES = 32;

interface UMKData {
  umk_salt: string;
  master_passphrase_verifier: string;
}


export const generateMnemonicPassphrase = (): string => {
    return bip39.generateMnemonic(256);
};

export const generateRandomBytes = (length: number): Uint8Array => {
    return webcrypto.getRandomValues(new Uint8Array(length));
};

export const bufferToBase64 = (buffer: ArrayBuffer): string => {
    return Buffer.from(buffer).toString('base64');
};

export const base64ToBuffer = (base64: string): ArrayBuffer => {
    return Buffer.from(base64, 'base64').buffer;
};

export const deriveUMKData = async (masterKey: string): Promise<UMKData> => {
  const saltBuffer = new Uint8Array(UMK_SALT_BYTES);
  window.crypto.getRandomValues(saltBuffer);
  const umk_salt = btoa(String.fromCharCode(...saltBuffer));

  const encoder = new TextEncoder();
  const data = encoder.encode(masterKey + umk_salt);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const verifierMock = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  return {
    umk_salt,
    master_passphrase_verifier: verifierMock,
  };
};

export const generateAndWrapOVK = (umk: string): string => {
  console.log("Wrapping OVK with UMK:", umk);
  const mockOVK = "random_org_vault_key_12345";
  return btoa(mockOVK + "-wrapped-with-umk");
};

export const createVerifier = async (umk: CryptoKey): Promise<string> => {
    const exportedKey = await webcrypto.subtle.exportKey('raw', umk);
    const hashBuffer = await webcrypto.subtle.digest('SHA-256', exportedKey);
    return bufferToBase64(hashBuffer.slice(0, VERIFIER_LENGTH_BYTES));
};

export const wrapKey = async (keyToWrap: string, wrappingKey: CryptoKey): Promise<string> => {
    const keyBuffer = base64ToBuffer(keyToWrap);
    const keyToWrapObject = await webcrypto.subtle.importKey(
        'raw',
        keyBuffer,
        'AES-GCM',
        true,
        ['encrypt', 'decrypt']
    );

    const wrappedKeyBuffer = await webcrypto.subtle.wrapKey(
        'raw',
        keyToWrapObject,
        wrappingKey,
        { name: 'AES-GCM', iv: generateRandomBytes(IV_LENGTH_BYTES) }
    );

    return bufferToBase64(wrappedKeyBuffer);
};