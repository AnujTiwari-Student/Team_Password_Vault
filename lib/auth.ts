import NextAuth, { type NextAuthResult } from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db";
import { getAccountByUserId } from "@/data/account-data";
import { getUserById } from "@/data/users-data";

const result = NextAuth({
  ...authConfig,
  events: {
    async linkAccount({ user, account }) {
      console.log(`Account linked: ${account.provider} to user ${user.email}`);
      const userId = user.id as unknown as string;
      // await updateUser(userId);
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.email = token.email as string;
        session.user.masterPassphraseSetupComplete =
          !!token.masterPassphraseSetupComplete;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.twofa_enabled = token.twofa_enabled as boolean;
      }

      console.log("Session callback - session:", session);

      if (session.user) {
        session.user.masterPassphraseSetupComplete =
          !!token.masterPassphraseSetupComplete;
      }

      return session;
    },
    async jwt({ token }) {

      if(!token.sub) return token;

      const user = await getUserById(token.sub as string);
      if(!user) return token;

      const account = await getAccountByUserId(token.sub as string);

      console.log("JWT callback - token before:", token);
      console.log("JWT callback - user:", user);

      token.email = user?.email as string;
      token.masterPassphraseSetupComplete = !!user?.master_passphrase_verifier;
      token.twofa_enabled = !!account;

      return {
        ...token,
        user
      };

    },
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
});

export const handlers: NextAuthResult["handlers"] = result.handlers;
export const auth: NextAuthResult["auth"] = result.auth;
export const signIn: NextAuthResult["signIn"] = result.signIn;
export const signOut: NextAuthResult["signOut"] = result.signOut;
