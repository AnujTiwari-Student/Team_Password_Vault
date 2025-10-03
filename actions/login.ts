"use server";

import { getUserByEmail } from "@/data/users-data";
import { signIn } from "@/lib/auth";
import { verifyAuthPassword } from "@/lib/password-hash";
import { LoginSchema } from "@/schema/zod-schema";
import { withDB } from "@/utils/db-action";
import * as z from "zod";

type LoginActionState = {
  success: boolean;
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    _form?: string[];
  };
  user?: {
    id: string;
    email: string;
    umk_salt?: string;
    master_passphrase_verifier?: string | null;
  };
};

export const login = async (data: z.infer<typeof LoginSchema>): Promise<LoginActionState> => {
        const validatedFields = LoginSchema.safeParse(data);

        if (!validatedFields.success) {
            return {
                success: false,
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const { email, password } = validatedFields.data;

        const existingUser = await getUserByEmail(email);
        if (!existingUser) {
            return {
                success: false,
                errors: {
                    email: ["No user found with this email"],
                },
            };
        }

        const matchPassword = await verifyAuthPassword(existingUser.auth_hash!, password);
        if (!matchPassword) {
            return {
                success: false,
                errors: {
                    password: ["Incorrect password"],
                },
            };
        }

        const signinResult = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (signinResult?.error) {
            return {
                success: false,
                errors: {
                    _form: [signinResult.error || "Login failed. Please try again."],
                },
            };
        }

        return {
            success: true,
            message: "Login successful",
            user: {
                id: existingUser.id!.toString(),
                email: existingUser.email,
            },
        };
}