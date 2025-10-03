import argon2 from "argon2";
import * as crypto from "crypto";

const UMK_SALT_BYTES = 32;

export async function hashAuthPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyAuthPassword(hash: string, password: string): Promise<boolean> {
  return await argon2.verify(hash, password);
}

export function generateUmkSalt(): string {
  return crypto.randomBytes(UMK_SALT_BYTES).toString('hex');
}

export function deriveUserMasterKey(password: string, umkSalt: string): Buffer {
    const iterations = 100000;
    const keylen = 32;
    const digest = 'sha512';

    return crypto.pbkdf2Sync(
        password,
        Buffer.from(umkSalt, 'hex'),
        iterations,
        keylen,
        digest
    );
}