import NextAuth, { type NextAuthResult } from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import authConfig from "./auth.config"
import client from "@/db";

const result = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(client),
  secret: process.env.AUTH_SECRET,
});

export const handlers: NextAuthResult['handlers'] = result.handlers;
export const auth: NextAuthResult['auth'] = result.auth;
export const signIn: NextAuthResult['signIn'] = result.signIn;
export const signOut: NextAuthResult['signOut'] = result.signOut;
