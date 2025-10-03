import NextAuth, { type NextAuthResult } from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import authConfig from "./auth.config"
import clientPromise from "@/db/mongodb-client";

const result = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
});

export const handlers: NextAuthResult['handlers'] = result.handlers;
export const auth: NextAuthResult['auth'] = result.auth;
export const signIn: NextAuthResult['signIn'] = result.signIn;
export const signOut: NextAuthResult['signOut'] = result.signOut;
