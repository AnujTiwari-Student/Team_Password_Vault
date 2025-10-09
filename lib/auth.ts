import { getVaultByOrgId } from './../data/vault-data';
import NextAuth, { type NextAuthResult } from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/db";
import { getAccountByUserId } from "@/data/account-data";
import { getUserById, updateUser } from "@/data/users-data";
import { CustomOAuthAdapter } from "./custom-adapter";
import { getOrgById } from "@/data/org-data";
import { Org, Vault } from "@prisma/client";
import { getVaultByUserId } from "@/data/vault-data";

const result = NextAuth({
  ...authConfig,
  events: {
    async linkAccount({ user, account }) {

      console.log(`Account linked: ${account.provider} to user ${user.email}`);

      await updateUser(user.id as string);
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
        session.user.org = token.org as Org;
        session.user.account_type = token.account_type as "org" | "personal";
        session.user.vault = token.vault as Vault;
      }

      console.log("Session callback - session:", session);

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const user = await getUserById(token.sub as string);
      if (!user) return token;

      const account = await getAccountByUserId(token.sub as string);

      const org = await getOrgById(user.id as string);
      if (org) {
        token.org = org;
      }

      console.log("JWT callback - token before:", token);
      console.log("JWT callback - user:", user);

      token.email = user?.email as string;
      token.masterPassphraseSetupComplete = !!user?.master_passphrase_verifier;
      token.twofa_enabled = !!account;
      token.name = user?.name as string;
      token.account_type = user?.account_type;

      if(token.account_type === "personal") {
        const vault = await getVaultByUserId(user.id as string);
        if (vault) {
          token.vault = vault;
        }
      }else if (token.account_type === "org") {
        const vault = await getVaultByOrgId(org?.id as string);
        if (vault) {
          token.vault = vault;
        }
      }

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
