"use server";

import { getUserByEmail } from "@/data/users-data";
import { generateUmkSalt, hashAuthPassword } from "@/lib/password-hash";
import UserModel from "@/models/users-model";
import { RegisterSchema } from "@/schema/zod-schema";
import { withDB } from "@/utils/db-action";
import * as z from "zod";

type RegisterActionState = {
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

export const register = async (
  data: z.infer<typeof RegisterSchema>
): Promise<RegisterActionState> => {
  return withDB(async () => {
    const validatedFields = RegisterSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { email, password, confirmPassword } = validatedFields.data;

    if (password !== confirmPassword) {
      return {
        success: false,
        errors: {
          confirmPassword: ["Passwords do not match"],
        },
      };
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        errors: {
          email: ["User with this email already exists"],
        },
      };
    }

    const hashedPassword = await hashAuthPassword(password);

    if (!hashedPassword) {
      return {
        success: false,
        errors: {
          _form: ["An unexpected error occurred. Please try again later."],
        },
      };
    }

    const newUser = await UserModel.create({
      email,
      auth_hash: hashedPassword,
      auth_provider: "credentials",
      umk_salt: null,
      master_passphrase_verifier: null,
      twofa_enabled: false,
      public_key: null,
      last_login: null,
    });

    return {
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id!.toString(),
        email: newUser.email,
      },
    };
  });
};
