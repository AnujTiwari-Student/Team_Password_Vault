import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      _id?: string;
      masterPassphraseSetupComplete?: boolean;
      master_passphrase_verifier?: string | null;
      umk_salt?: string;
      auth_provider?: string;
      twofa_enabled?: boolean;
      public_key?: string | null;
      created_at?: Date;
      last_login?: Date | null;
      auth_hash?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    user: {
      email: string;
      _id?: string;
      masterPassphraseSetupComplete?: boolean;
      master_passphrase_verifier?: string | null;
      umk_salt?: string;
      auth_provider?: string;
      twofa_enabled?: boolean;
      public_key?: string | null;
      created_at?: Date;
      last_login?: Date | null;
      auth_hash?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    _id: string;
    masterPassphraseSetupComplete?: boolean;
    master_passphrase_verifier?: string | null;
    umk_salt?: string;
    auth_provider?: string;
    twofa_enabled?: boolean;
    public_key?: string | null;
    created_at?: Date;
    last_login?: Date | null;
    auth_hash?: string;
    email?: string;
    role?: string;
  }
}
