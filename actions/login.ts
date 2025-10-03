"use server";

import { verifyAuthPassword } from "@/lib/password-hash";
import UserModel from "@/models/users-model";
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
  };
};

export const login = async (data: z.infer<typeof LoginSchema>): Promise<LoginActionState> => {
    return withDB(async () => {
        const validatedFields = LoginSchema.safeParse(data);

        if (!validatedFields.success) {
            return {
                success: false,
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const { email, password } = validatedFields.data;

        const existingUser = await UserModel.findOne({ email }).select('+auth_hash +umk_salt');
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

        return {
            success: true,
            message: "Login successful",
            user: {
                id: existingUser._id!.toString(),
                email: existingUser.email,
            },
        };
    })
}