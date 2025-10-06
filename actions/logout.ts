"use server";

import { signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export const logout = async () => {
  try {
    await signOut({
      redirect: false,
    });
    redirect("/auth/login");
  } catch (error) {
    console.error("Error during signOut:", error);
    redirect('/dashboard');
  }
};
