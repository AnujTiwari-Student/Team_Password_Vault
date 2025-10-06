"use server";


import argon2 from "argon2";

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