import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "@/schema/zod-schema";
import { getUserByEmail } from "@/data/users-data";
import { verifyAuthPassword } from "./password-hash";


export default {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            // @ts-expect-error NextAuth types are incorrect
            authorize: async (credentials) => {

                if(!credentials) {
                    console.error("No credentials provided");
                    return null
                }

                try {
                    
                    const { ...authData } = credentials;
                    console.log("Auth data:", authData);

                    const validated = LoginSchema.safeParse(authData);
                    if (!validated.success) {
                        console.error("Invalid input schema", validated.error.format());
                        return null
                    }

                    const { email, password } = validated.data;

                    const existingUser = await getUserByEmail(email);

                    if (!existingUser) {
                        console.error("No user found with this email");
                        return null;
                    }

                    const isPasswordValid = await verifyAuthPassword(existingUser.auth_hash || "", password);
                    if (!isPasswordValid) {
                        console.error("Incorrect password");
                        return null;
                    }

                    return {
                        id: existingUser.id!.toString(),
                        email: existingUser.email,
                        masterPassphraseSetupComplete: !!existingUser.master_passphrase_verifier,                        
                    };    

                } catch (error) {
                    console.error("Error in authorize:", error);
                    return null;
                }
            },
        }),
    ],
} satisfies NextAuthConfig;
