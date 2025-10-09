import { getOrgById } from '@/data/org-data';
import { prisma } from '@/db';
import { currentUser } from '@/lib/current-user';
import { NextRequest, NextResponse } from 'next/server';

type ItemType = 'login' | 'note' | 'totp';

interface ItemCreationPayload {
    item_name: string;
    item_url: string;
    vaultId: string;
    type: ItemType; 
    tags?: string[];
    item_key_wrapped: string; 
    username_ct?: string; 
    password_ct?: string;
    totp_seed_ct?: string;
    notes_ct?: string;
    created_by: string
}

export async function POST(req: NextRequest) {
    try {
        console.log("API hit for item creation");
        const body: ItemCreationPayload = await req.json();
        const { item_name, item_url, vaultId, type, tags, item_key_wrapped, created_by, ...ciphertextFields } = body;

        if (!vaultId || !item_key_wrapped || !item_name || !type) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // const hasPermission = await permissionCheck(session.user.id, vaultId, 'vault', 'edit');
        // if (!hasPermission) {
        //     return NextResponse.json({ message: 'Forbidden: Insufficient permissions to add items to this vault.' }, { status: 403 });
        // }
        
        const newItem = await prisma.item.create({
            data: {
                vault_id: vaultId,
                type: type,
                name: item_name,
                url: item_url,
                item_key_wrapped: item_key_wrapped,
                username_ct: ciphertextFields.username_ct || null,
                password_ct: ciphertextFields.password_ct || null,
                totp_seed_ct: ciphertextFields.totp_seed_ct || null,
                note_ct: ciphertextFields.notes_ct || null,
                tags: tags || [],
                created_by,
                updated_at: new Date(),
            },
        });

        const orgId = await getOrgById(created_by!); 
        if (!orgId) {
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
        await prisma.audit.create({
            data: {
                org_id: orgId.id!,
                actor_user_id: created_by!,
                action: 'ITEM_CREATED',
                subject_type: 'item',
                subject_id: newItem.id,
                meta: { name: item_name, vaultId }, 
            },
        });

        return NextResponse.json(
            { 
                message: 'Item created successfully.', 
                id: newItem.id 
            }, 
            { status: 201 }
        );

    } catch (error) {
        console.error("Item creation error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        const vaultId = searchParams.get('vault_id');
        const query = searchParams.get('q'); 

        if (!vaultId || !query) {
            return NextResponse.json({ message: 'Query parameter vault_id is required' }, { status: 400 });
        }
        
        // const hasPermission = await permissionCheck(session.user.id, vaultId, 'vault', 'view');
        // if (!hasPermission) {
        //     return NextResponse.json({ message: 'Forbidden: Insufficient permissions to view this vault.' }, { status: 403 });
        // }

        const filter = { vault_id: vaultId };

        const items = await prisma.item.findMany({ 
            where: filter,
            select: { 
                id: true, 
                name: true, 
                url: true, 
                type: true, 
                tags: true, 
                item_key_wrapped: true,
                username_ct: true,
                password_ct: true,
                totp_seed_ct: true,
                note_ct: true,
                updated_at: true,
            }
        });

        return NextResponse.json(items, { status: 200 });

    } catch (error) {
        console.error("Item list error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}