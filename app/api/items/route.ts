import { getOrgById } from '@/data/org-data';
import { prisma } from '@/db';
import { currentUser } from '@/lib/current-user';
import { permissionCheck } from '@/lib/middlewares/permission';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

type ItemType = 'login' | 'note' | 'totp';

interface ItemCreationPayload {
    item_name: string;
    item_url?: string;
    vaultId: string;
    type: ItemType[]; 
    tags?: string[];
    item_key_wrapped: string; 
    username_ct?: string; 
    password_ct?: string;
    totp_seed_ct?: string;
    notes_ct?: string; 
    created_by: string;
}

export async function POST(req: NextRequest) {
    try {
        console.log("API hit for item creation");
        
        const user = await currentUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body: ItemCreationPayload = await req.json();
        const { 
            item_name, 
            item_url, 
            vaultId, 
            type, 
            tags, 
            item_key_wrapped, 
            created_by, 
            ...ciphertextFields 
        } = body;

        console.log("Received payload:", { ...body, item_key_wrapped: '[REDACTED]' });

        if (!vaultId || !item_key_wrapped || !item_name || !type || !Array.isArray(type) || type.length === 0) {
            return NextResponse.json({ 
                message: 'Missing required fields. Need: item_name, vaultId, type (array), item_key_wrapped' 
            }, { status: 400 });
        }

        const validTypes: ItemType[] = ['login', 'note', 'totp'];
        const invalidTypes = type.filter(t => !validTypes.includes(t));
        if (invalidTypes.length > 0) {
            return NextResponse.json({ 
                message: `Invalid item types: ${invalidTypes.join(', ')}. Valid types: ${validTypes.join(', ')}` 
            }, { status: 400 });
        }

        const validationErrors: string[] = [];
        
        if (type.includes('login')) {
            if (!ciphertextFields.username_ct && !ciphertextFields.password_ct) {
                validationErrors.push('Login items must have at least username or password');
            }
        }
        
        if (type.includes('note')) {
            if (!ciphertextFields.notes_ct) {
                validationErrors.push('Note items must have note content');
            }
        }
        
        if (type.includes('totp')) {
            if (!ciphertextFields.totp_seed_ct) {
                validationErrors.push('TOTP items must have a secret key');
            }
        }

        if (validationErrors.length > 0) {
            return NextResponse.json({ 
                message: 'Validation errors', 
                errors: validationErrors 
            }, { status: 400 });
        }

        const hasPermission = await permissionCheck(user.id, vaultId, 'vault', 'edit');
        if (!hasPermission) {
            return NextResponse.json({ 
                message: 'Forbidden: Insufficient permissions to add items to this vault.' 
            }, { status: 403 });
        }
        
        const newItem = await prisma.item.create({
            data: {
                vault_id: vaultId,
                type: type,
                name: item_name,
                url: item_url || null,
                item_key_wrapped: item_key_wrapped,
                username_ct: ciphertextFields.username_ct || null,
                password_ct: ciphertextFields.password_ct || null,
                totp_seed_ct: ciphertextFields.totp_seed_ct || null,
                note_ct: ciphertextFields.notes_ct || null,
                tags: tags || [],
                created_by: user.id,
                updated_at: new Date(),
            },
        });

        console.log("Item created successfully:", newItem.id);

        try {
            const orgData = await getOrgById(user.id);
            if (orgData?.id) {
                await prisma.audit.create({
                    data: {
                        org_id: orgData.id,
                        actor_user_id: user.id,
                        action: 'ITEM_CREATED',
                        subject_type: 'item',
                        subject_id: newItem.id,
                        meta: { 
                            name: item_name, 
                            vaultId,
                            types: type,
                            hasUrl: !!item_url,
                            hasUsername: !!ciphertextFields.username_ct,
                            hasPassword: !!ciphertextFields.password_ct,
                            hasTotp: !!ciphertextFields.totp_seed_ct,
                            hasNote: !!ciphertextFields.notes_ct
                        }, 
                    },
                });
            }
        } catch (auditError) {
            console.error("Audit log creation failed:", auditError);
        }

        return NextResponse.json(
            { 
                message: 'Item created successfully.', 
                id: newItem.id,
                types: type
            }, 
            { status: 201 }
        );

    } catch (error) {
        console.error("Item creation error:", error);
        
        if (error instanceof Error) {
            if (error.message.includes('E11000')) { 
                return NextResponse.json({ 
                    message: 'Item with this name already exists in vault' 
                }, { status: 409 });
            }
        }
        
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        }, { status: 500 });
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

        if (!vaultId) {
            return NextResponse.json({ 
                message: 'Query parameter vault_id is required' 
            }, { status: 400 });
        }
        
        const hasPermission = await permissionCheck(user.id, vaultId, 'vault', 'edit');
        if (!hasPermission) {
            return NextResponse.json({ 
                message: 'Forbidden: Insufficient permissions to view this vault.' 
            }, { status: 403 });
        }

        const searchQuery = searchParams.get('q');
        const typeFilter = searchParams.get('type');
        const tagFilter = searchParams.get('tag');

        const whereClause: Prisma.ItemWhereInput = { 
            vault_id: vaultId 
        };

        if (searchQuery) {
            whereClause.OR = [
                { 
                    name: { 
                        contains: searchQuery, 
                        mode: 'insensitive' 
                    } 
                },
                { 
                    tags: { 
                        hasSome: [searchQuery] 
                    } 
                }
            ];
        }

        if (typeFilter && ['login', 'note', 'totp'].includes(typeFilter)) {
            whereClause.type = { 
                hasSome: [typeFilter as ItemType]
            };
        }

        if (tagFilter) {
            whereClause.tags = { 
                hasSome: [tagFilter]
            };
        }

        console.log("MongoDB Query:", JSON.stringify(whereClause, null, 2));

        const items = await prisma.item.findMany({ 
            where: whereClause,
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
            },
            orderBy: { updated_at: 'desc' }
        });

        return NextResponse.json({
            items,
            count: items.length,
            vault_id: vaultId,
            filters_applied: {
                search: searchQuery,
                type: typeFilter,
                tag: tagFilter
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Item list error:", error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        }, { status: 500 });
    }
}
