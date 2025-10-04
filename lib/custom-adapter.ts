import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { AdapterUser } from "@auth/core/adapters";

type OAuthUser = {
    id?: string;
    name: string | null;
    email: string;
    email_verified?: Date | null;
    image?: string | null;
    auth_provider?: string;
    auth_hash?: string | null;
    umk_salt?: string | null;
    master_passphrase_verifier?: string | null;
    twofa_enabled?: boolean;
    public_key?: string | null;
    last_login?: Date | null;
}

export const CustomOAuthAdapter = (db: PrismaClient) => {
  const baseAdapter = PrismaAdapter(db);

  return {
    ...baseAdapter,

    async createUser(user: OAuthUser & { role?: string }): Promise<AdapterUser> {
      try {
        const userRole = user.role || "member";

        const userData = {
          name: user.name,
          email: user.email,
          email_verified: user.email_verified || null,
          image: user.image || null,
          auth_provider: "oauth",
          auth_hash: null,
          umk_salt: user.umk_salt || null,
          master_passphrase_verifier: user.master_passphrase_verifier || null,
          twofa_enabled: true,
          public_key: user.public_key || null,
          last_login: user.last_login || null,
          role: userRole,
        };

        const newUser = await db.user.create({
          data: userData,
        });

        return {
          ...user,
          id: newUser.id.toString(),
        };
      } catch (error) {
        console.error(`Error creating user via OAuth for ${user.email}:`, error);
        throw error;
      }
    },
  };
};
