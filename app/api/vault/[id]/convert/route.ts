import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db";
import { currentUser } from "@/lib/current-user";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: vaultId } = params;
    const { targetType } = await req.json();

    console.log("🔄 [POST /api/vault/[id]/convert] Called:", { 
      vaultId, 
      userId: user.id, 
      targetType 
    });

    if (!["personal", "org"].includes(targetType)) {
      return NextResponse.json({ 
        error: "Invalid vault type. Must be 'personal' or 'org'" 
      }, { status: 400 });
    }

    // Get vault
    const vault = await prisma.vault.findUnique({
      where: { id: vaultId }
    });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    // Only vault owner can convert
    if (vault.user_id !== user.id) {
      return NextResponse.json({ 
        error: "Only vault owner can convert vault type" 
      }, { status: 403 });
    }

    // Check if already the target type
    if (vault.type === targetType) {
      return NextResponse.json({ 
        error: `Vault is already of type '${targetType}'` 
      }, { status: 400 });
    }

    let updatedVault;

    if (targetType === "personal") {
      console.log("🔄 Converting org vault to personal...");

      if (!vault.org_id) {
        return NextResponse.json({ 
          error: "Invalid org vault" 
        }, { status: 400 });
      }

      const personalVaultKey = await prisma.personalVaultKey.findUnique({
        where: { user_id: user.id }
      });

      const newOvkId = personalVaultKey?.id || vault.ovk_id;

      await prisma.membership.deleteMany({
        where: {
          org_id: vault.org_id,
          user_id: { not: user.id }
        }
      });

      // Update vault
      updatedVault = await prisma.vault.update({
        where: { id: vaultId },
        data: { 
          type: "personal",
          org_id: null,
          ovk_id: newOvkId,
          personalVaultKeyId: personalVaultKey?.id,
          orgVaultKeyId: null
        }
      });

      console.log("✅ Vault converted to personal");

    } else {
      // Converting from personal to org
      console.log("🔄 Converting personal vault to org...");

      // Create new org
      const newOrg = await prisma.org.create({
        data: {
          name: `${vault.name} Organization`,
          owner_user_id: user.id
        }
      });

      // Check if OrgVaultKey exists for this org, otherwise create
      let orgVaultKey = await prisma.orgVaultKey.findFirst({
        where: { org_id: newOrg.id }
      });

      if (!orgVaultKey) {
        // Get the user's personal vault key cipher to use for org
        const personalKey = await prisma.personalVaultKey.findUnique({
          where: { user_id: user.id }
        });

        orgVaultKey = await prisma.orgVaultKey.create({
          data: {
            org_id: newOrg.id,
            ovk_cipher: personalKey?.ovk_cipher || "" // Use existing cipher or empty
          }
        });
      }

      // Create owner membership
      await prisma.membership.create({
        data: {
          user_id: user.id,
          org_id: newOrg.id,
          role: "owner",
          ovk_wrapped_for_user: orgVaultKey.ovk_cipher
        }
      });

      // Update vault
      updatedVault = await prisma.vault.update({
        where: { id: vaultId },
        data: {
          type: "org",
          org_id: newOrg.id,
          ovk_id: orgVaultKey.id,
          orgVaultKeyId: orgVaultKey.id,
          personalVaultKeyId: null
        }
      });

      console.log("✅ Vault converted to org:", newOrg.id);
    }

    return NextResponse.json({
      message: `Vault successfully converted to ${targetType}`,
      vault: updatedVault
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error converting vault:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
