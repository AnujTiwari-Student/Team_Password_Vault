import { NextResponse } from "next/server";
import crypto from "crypto";
import { getUserById } from "@/data/users-data";
import OrgModel from "@/models/org-model";
import { withDB } from "@/utils/db-action";

const generateRandomKey = (): string => {
  const key = crypto.randomBytes(32);
  return key.toString("base64");
};

export async function POST(request: Request) {
  return withDB(async () => {
    try {
      const {
        userId,
        userEmail,
        umk_salt_b64,
        master_passphrase_verifier_b64,
      } = await request.json();

      const user = await getUserById(userId);

      if (!user || user.email !== userEmail) {
        return NextResponse.json(
          { message: "Invalid user session or ID." },
          { status: 401 }
        );
      }

      if (user.master_passphrase_verifier) {
        return NextResponse.json(
          { message: "E2EE is already initialized for this user." },
          { status: 400 }
        );
      }

      user.umk_salt = umk_salt_b64;
      user.master_passphrase_verifier = master_passphrase_verifier_b64;
      await user.save();

      const newOrg = new OrgModel({
        name: `${user.email.split("@")[0]}'s Organization`,
        owner_user_id: user._id,
        created_at: new Date(),
      });
      await newOrg.save();
      const orgId = newOrg._id;
      
      const orgVaultKey = generateRandomKey();

      return NextResponse.json(
        {
          message: "User updated and OVK generated.",
          org_id: orgId,
          org_vault_key_b64: orgVaultKey,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Key Initialization error:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
