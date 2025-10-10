import { prisma } from "@/db";
import { MemberRole } from "@prisma/client";

type TargetType = 'vault' | 'item';
type Permission = 'view' | 'edit' | 'share' | 'manage';
type Role = MemberRole;

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    owner: ['view', 'edit', 'share', 'manage'],
    admin: ['view', 'edit', 'share', 'manage'],
    member: ['view', 'edit'], 
    viewer: ['view'], 
};

export async function permissionCheck(
    userId: string,
    targetId: string,
    targetType: TargetType,
    requiredPerm: Permission
): Promise<boolean> {
    try {
        let orgId: string | null = null;
        let vaultId: string | null = null;
        
        if (targetType === 'item') {
            const item = await prisma.item.findUnique({ 
                where: { id: targetId },
                select: { vault_id: true }
            });
            if (!item) return false;
            vaultId = item.vault_id;
        } else {
            vaultId = targetId;
        }

        const vault = await prisma.vault.findUnique({ 
            where: { id: vaultId },
            select: { org_id: true }
        });
        if (!vault) return false;
        
        orgId = vault.org_id;
        
        if (!orgId) {
            if (vault.org_id === userId) {
                return true;
            }
            return false;
        }
        
        const effectivePerms: Set<Permission> = new Set();
        
        const membership = await prisma.membership.findFirst({ 
            where: { user_id: userId, org_id: orgId },
            select: { role: true }
        });
        
        if (!membership) return false;
        
        const userRole: Role = membership.role as Role;
        
        ROLE_PERMISSIONS[userRole].forEach(p => effectivePerms.add(p));

        return effectivePerms.has(requiredPerm);

    } catch (error) {
        console.error(`Permission check error for User ${userId}:`, error);
        return false; 
    }
}
