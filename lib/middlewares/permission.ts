
import { prisma } from "@/db";
import { MemberRole } from "@prisma/client";

type TargetType = 'vault' | 'item';
type Permission = 'view' | 'edit' | 'share' | 'manage';
type Role = 'owner' | 'admin' | 'member' | 'viewer';

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
        let vaultId: string | null = targetId;
        
        if (targetType === 'item') {
            const item = await prisma.item.findMany({ where: { vault_id: targetId } });
            if (!item) return false;

            vaultId = item[0].vault_id;
        }

        const vault = await prisma.vault.findUnique({ where: { id: vaultId } });
        if (!vault) return false;
        
        orgId = vault.org_id || userId; 
        
        const effectivePerms: Set<Permission> = new Set();
        
        const membership = await prisma.membership.findFirst({ where: { user_id: userId, org_id: orgId } });
        const userRole: MemberRole = (membership?.role as MemberRole) || 'viewer'; 
        
        ROLE_PERMISSIONS[userRole].forEach(p => effectivePerms.add(p));

        if (userRole === 'owner' || userRole === 'admin') {
            return effectivePerms.has(requiredPerm);
        }

        // --- 3. Check Explicit Shares (Vault or Item level) ---
        // const shareRecords = await prisma.share.findMany({
        //     $or: [
        //         // Shares granted explicitly to this user for the target
        //         { target_id: targetId, grantee_type: 'user', grantee_id: userId },
        //         // Shares granted to the user's role for the target
        //         { target_id: targetId, grantee_type: 'role', grantee_role: userRole },
        //         // If checking an Item, also check shares on the parent Vault
        //         ...(targetType === 'item' ? [
        //             { target_id: vaultId, grantee_type: 'user', grantee_id: userId },
        //             { target_id: vaultId, grantee_type: 'role', grantee_role: userRole }
        //         ] : []),
        //     ]
        // });

        // Combine permissions from all share records
        // shareRecords.forEach(share => {
        //     Object.keys(share.perms).filter(p => share.perms[p as Permission]).forEach(p => {
        //         effectivePerms.add(p as Permission);
        //     });
        // });
        
        // // --- 4. Final Check ---
        return effectivePerms.has(requiredPerm);

    } catch (error) {
        console.error(`Permission check error for User ${userId}:`, error);
        return false; // Fail safe on error
    }
}