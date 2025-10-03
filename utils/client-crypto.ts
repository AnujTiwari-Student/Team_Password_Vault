import { webcrypto } from "crypto";

const PBKDF2_ITERATIONS = 100000;
const AES_GCM_KEY_LENGTH = 256;
const IV_LENGTH_BYTES = 12;
const SALT_LENGTH_BYTES = 16;
const VERIFIER_LENGTH_BYTES = 32;

const WORD_LIST = ["spirit", "river", "ocean", "mountain", "fire", "galaxy", "shadow", "phoenix", "lightning", "dragon"];

export const generateMnemonicPassphrase = (): string => {
    const words = Array.from({ length: 3 }, () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    const number = Math.floor(100 + Math.random() * 900);
    return `${words.join('-')}-${number}`;
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

export const generateUmkSalt = (): string => {
    return bufferToBase64(generateRandomBytes(SALT_LENGTH_BYTES));
};

export const generateOrgKey = (): string => {
    return bufferToBase64(generateRandomBytes(AES_GCM_KEY_LENGTH / 8));
};

export const deriveUMK = async (passphrase: string, salt: string): Promise<CryptoKey> => {
    const saltBuffer = base64ToBuffer(salt);
    const passPhraseBuffer = new TextEncoder().encode(passphrase);

    const keyMaterial = await webcrypto.subtle.importKey(
        'raw',
        passPhraseBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return webcrypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        {
            name: 'AES-GCM',
            length: AES_GCM_KEY_LENGTH,
        },
        true,
        ['wrapKey', 'unwrapKey']
    );
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