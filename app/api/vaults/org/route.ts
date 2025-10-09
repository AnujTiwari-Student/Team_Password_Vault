import { NextRequest, NextResponse } from "next/server";
import { getOrgOvkCypherKey } from "@/data/cyper-key-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("id");

  console.log("API hit for org vault key:", orgId);

  if (!orgId) {
    return NextResponse.json({ error: "Invalid orgId type", status: 400 }, { status: 400 });
  }

  try {
    const orgVaultKey = await getOrgOvkCypherKey(orgId);
    if (!orgVaultKey) {
      console.warn(`❌ Org vault key not found for orgId: ${orgId}`);
      return NextResponse.json({ error: "Org vault key not found", status: 404 }, { status: 404 });
    }

    console.log("✅ orgVaultKey found:", orgVaultKey);
    return NextResponse.json({ ovk_cipher: orgVaultKey.ovk_cipher });
  } catch (error) {
    console.error("💥 Error fetching org vault key:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching org vault key", status: 500 },
      { status: 500 }
    );
  }
}
