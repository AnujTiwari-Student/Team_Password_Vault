import { prisma } from '@/db';
import { currentUser } from '@/lib/current-user';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getOrgVaultForUser, checkOrgVaultAccess, checkOrgVaultAccessPermissions } from '@/data/vault-data';

type ItemType = 'login' | 'note' | 'totp';

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user || !user.id) {
            return NextResponse.json({ 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        const { searchParams } = req.nextUrl;
        
        const orgVault = await getOrgVaultForUser(user.id);
        
        if (!orgVault) {
            return NextResponse.json({ 
                message: 'No organization vault found. You may not be a member of any organization.' 
            }, { status: 404 });
        }

        const hasAccess = await checkOrgVaultAccessPermissions(user.id, orgVault.org_id!);
        if (!hasAccess) {
            return NextResponse.json({ 
                message: 'Forbidden: Insufficient permissions to view organization vault.' 
            }, { status: 403 });
        }

        const searchQuery = searchParams.get('q');
        const typeFilter = searchParams.get('type');
        const tagFilter = searchParams.get('tag');

        const whereClause: Prisma.ItemWhereInput = { 
            vault_id: orgVault.id 
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

        console.log("Organization Items Query:", JSON.stringify(whereClause, null, 2));

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

        const userAccess = await checkOrgVaultAccess(user.id, orgVault.org_id!);

        return NextResponse.json({
            items,
            count: items.length,
            vault_id: orgVault.id,
            vault_name: orgVault.name,
            vault_type: 'org',
            user_role: userAccess?.role || 'unknown',
            org_id: orgVault.org_id,
            filters_applied: {
                search: searchQuery,
                type: typeFilter,
                tag: tagFilter
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Organization items list error:", error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        }, { status: 500 });
    }
}
