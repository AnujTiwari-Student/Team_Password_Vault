import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";


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
            authorize: async (credentials) => {

                try {
                    
                    const { email, password } = credentials as { email: string; password: string };

                    if(!email || !password) {
                        return null;
                    }

                } catch (error) {
                    console.error("Error in authorize:", error);
                    return null;
                }

                return null;
            },
        }),
    ],
} satisfies NextAuthConfig;
