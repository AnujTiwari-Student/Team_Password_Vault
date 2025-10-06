import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { currentUser } from "@/lib/current-user";

export async function POST(request: Request) {
    const user = await currentUser(); 

    if (!user || !user.id || !user.email) {
        return NextResponse.json({ error: "Unauthorized or missing session data" }, { status: 401 });
    }

    const userId = user.id;
    
    const body = await request.json();
    const { 
        umk_salt, 
        master_passphrase_verifier, 
        ovk_wrapped_for_user, 
        org_name 
    } = body;

    if (!umk_salt || !master_passphrase_verifier || !ovk_wrapped_for_user || !org_name) {
        console.warn("Received incomplete key material for setup:", Object.keys(body));
        return NextResponse.json({ 
            error: "Missing required client-side generated key materials or Organization Name." 
        }, { status: 400 });
    }

    try {
        const [newOrg] = await prisma.$transaction(async (tx) => {
            
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    umk_salt: umk_salt,
                    master_passphrase_verifier: master_passphrase_verifier,
                },
                select: { id: true, email: true, name: true } 
            });

            const newOrg = await tx.org.create({
                data: {
                    name: org_name,
                    owner_user_id: userId,
                },
            });

            await tx.membership.create({
                data: {
                    org_id: newOrg.id,
                    user_id: userId,
                    role: 'owner', 
                    ovk_wrapped_for_user: ovk_wrapped_for_user, 
                },
            });

            await tx.vault.create({
                data: {
                    org_id: newOrg.id,
                    name: `${org_name} Default Vault`,
                    type: 'org',
                    ovk_id: newOrg.id, 
                }
            });

            await tx.audit.create({
                data: {
                    org_id: newOrg.id,
                    actor_user_id: userId,
                    action: 'ORG_CREATED_AND_UMK_SETUP',
                    subject_type: 'org',
                    subject_id: newOrg.id,
                    ip: request.headers.get('x-forwarded-for') || 'unknown',
                    ua: request.headers.get('user-agent') || 'unknown',
                    meta: { 
                        ownerEmail: updatedUser.email, 
                        orgName: org_name 
                    },
                }
            });


            return [updatedUser, newOrg];
        });

        return NextResponse.json({ 
            message: "Setup complete: Master Passphrase, User, Org, and Membership created.",
            orgId: newOrg.id
        }, { status: 200 });

    } catch (error) {
        console.error("Critical setup transaction failed:", error);
        return NextResponse.json({ 
            error: "Server error during critical setup. Setup failed." 
        }, { status: 500 });
    }
}
