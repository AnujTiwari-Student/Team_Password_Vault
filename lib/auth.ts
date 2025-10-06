import NextAuth, { type NextAuthResult } from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/db";
import { getAccountByUserId } from "@/data/account-data";
import { getUserById, updateUser } from "@/data/users-data";
import { CustomOAuthAdapter } from "./custom-adapter";

const result = NextAuth({
  ...authConfig,
  events: {
    async linkAccount({ user, account }) {
      const role = user.role || "owner";

      console.log(`Account linked: ${account.provider} to user ${user.email}`);

      await updateUser(user.id as string, role);
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
        session.user.masterPassphraseSetupComplete =
          !!token.masterPassphraseSetupComplete;
      }

      if (token.role) {
        session.user.role = token.role as string;
      }

      console.log("Session callback - session:", session);

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const user = await getUserById(token.sub as string);
      if (!user) return token;

      const account = await getAccountByUserId(token.sub as string);

      console.log("JWT callback - token before:", token);
      console.log("JWT callback - user:", user);

      token.email = user?.email as string;
      token.masterPassphraseSetupComplete = !!user?.master_passphrase_verifier;
      token.twofa_enabled = !!account;
      token.role = "owner";

      return {
        ...token,
        user,
      };
    },
  },
  // @ts-expect-error type issue with next-auth and prisma adapter
  adapter: CustomOAuthAdapter(prisma),
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
