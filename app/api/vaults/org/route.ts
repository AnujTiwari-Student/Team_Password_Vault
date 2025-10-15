import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", status: 401 }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vaultId = searchParams.get("id");

    if (!vaultId) {
      return NextResponse.json({ error: "Invalid vault ID", status: 400 }, { status: 400 });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        user_id: session.user.id,
        org: {
          vaults: {
            some: { id: vaultId }
          }
        }
      },
      select: {
        ovk_wrapped_for_user: true
      }
    });

    if (!membership?.ovk_wrapped_for_user) {
      return NextResponse.json({ error: "Vault access denied", status: 403 }, { status: 403 });
    }

    return NextResponse.json({ 
      ovk_wrapped_for_user: membership.ovk_wrapped_for_user 
    });

  } catch (error) {
    console.error("Error fetching org vault key:", error);
    return NextResponse.json(
      { error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
