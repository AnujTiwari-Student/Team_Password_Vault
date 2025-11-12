import { getVaultByOrgId } from "./../data/vault-data";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/db";
import { getUserById, updateUser } from "@/data/users-data";
import { CustomOAuthAdapter } from "./custom-adapter";
import { getOrgById } from "@/data/org-data";
import { Membership, Org, Vault } from "@prisma/client";
import { getVaultByUserId } from "@/data/vault-data";
import { getMemberByOrgAndUserId } from "@/data/member-data";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  events: {
    async linkAccount({ user, account }) {
      console.log(`Account linked: ${account.provider} to user ${user.email}`);
      await updateUser(user.id as string);
    },
  },
  callbacks: {
    async signIn({ user, account, credentials }) {
      if (account?.provider !== "credentials") {
        return true;
      }
      
      const existingUser = await getUserById(user.id as string);
      
      if (!existingUser) {
        return false;
      }

      if (existingUser.twofa_enabled === true && 
          !credentials?.twoFactorVerified && 
          !credentials?.skipPasswordCheck) {
        return false;
      }
      
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.email = token.email as string;
        session.user.masterPassphraseSetupComplete =
          !!token.masterPassphraseSetupComplete;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.twofa_enabled = token.twofa_enabled as boolean;
        session.user.org = token.org as Org;
        session.user.account_type = token.account_type as "org" | "personal";
        session.user.vault = token.vault as Vault;
        session.user.public_key = token.public_key as string;

        if (token.member) {
          const allMemberships = token.member;
          const userMembership = (allMemberships as Membership[]).find(
            (m) => m.user_id === token.sub
          );

          session.user.member = userMembership as Membership;
        } else {
          session.user.member = null;
        }
      }

      return session;
    },
    async jwt({ token, trigger, session, user }) {
      if (!token.sub) return token;

      if (trigger === "update" && session?.twoFactorVerified) {
        token.twoFactorVerified = true;
      }

      if (trigger === "signIn" && user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      const dbUser = await getUserById(token.sub as string);
      if (!dbUser) return token;

      const org = await getOrgById(dbUser.id as string);
      
      if (org) {
        token.org = org;
      }

      const members = await getMemberByOrgAndUserId(
        org?.id as string,
        dbUser.id as string
      );
      
      if (members && members.length > 0) {
        token.member = members;
      } else {
        token.member = null;
      }

      token.email = dbUser?.email as string;
      token.masterPassphraseSetupComplete = !!dbUser?.master_passphrase_verifier;
      token.twofa_enabled = dbUser?.twofa_enabled || false;
      token.name = dbUser?.name as string;
      token.account_type = dbUser?.account_type;
      token.public_key = dbUser?.public_key as string;

      if (token.account_type === "personal") {
        const vault = await getVaultByUserId(dbUser.id as string);
        if (vault) {
          token.vault = vault;
        }
      } else if (token.account_type === "org") {
        const vault = await getVaultByOrgId(org?.id as string);
        if (vault) {
          token.vault = vault;
        }
      }

      console.log("Before modifying JWT Token:", token);

      return {
        ...token,
        user: dbUser,
      };
    },
  },
  // @ts-expect-error TS2345
  adapter: CustomOAuthAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
});
