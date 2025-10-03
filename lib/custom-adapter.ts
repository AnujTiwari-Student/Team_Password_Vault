import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import z from "zod";


const OAuthUserSchema = z.object({
    email: z.string().email(),
    name: z.string().nullable().optional(),
    image: z.string().url().nullable().optional(),
    emailVerified: z.date().nullable().optional(),
    umk_salt: z.string().nullable().optional(),
    master_passphrase_verifier: z.string().nullable().optional(),
    public_key: z.string().nullable().optional(),
    twofa_enabled: z.boolean().default(true),
    auth_provider: z.enum(['oauth']),
    auth_hash: z.string().nullable().optional(),
    last_login: z.date().nullable().optional(),
})

export const CustomOAuthAdapter = (db: PrismaClient) => {
    const baseAdapter = PrismaAdapter(db);

    return {
        ...baseAdapter,
        async createUser(user: z.infer<typeof OAuthUserSchema>) {
            try {
                
                const validatedUser = OAuthUserSchema.parse(user);

                const newUser = await db.user.create({
                    data: {
                        ...validatedUser
                    }
                });

                return newUser;

            } catch (error) {
                console.error(`Error creating user via OAuth for ${user.email}:`, error);
                throw error;
            }
        }
            
    }
}