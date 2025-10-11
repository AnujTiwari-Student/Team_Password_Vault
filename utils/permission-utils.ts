import { MemberRole, User, Vault, Membership } from "@/types/vault";

type Permission = 'view' | 'edit' | 'share' | 'manage' | 'decrypt';

const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
    owner: ['view', 'edit', 'share', 'manage', 'decrypt'],
    admin: ['view', 'edit', 'share', 'manage', 'decrypt'],
    member: ['view', 'decrypt', 'share'], 
    viewer: ['view', 'decrypt'], 
};

export function getUserRoleInVault(user: User | null, vault: Vault | null): MemberRole | null {
    if (!user || !vault) return null;
    
    if (vault.type === 'personal') {
        return vault.user_id === user.id ? 'owner' : null;
    }
    
    if (vault.type === 'org' && vault.org_id) {
        if (user.member) {
            let memberships: Membership[] = [];
            
            if (Array.isArray(user.member)) {
                memberships = user.member;
            } else {
                memberships = [user.member];
            }
            
            const membership = memberships.find((m: Membership) => m.org_id === vault.org_id);
            
            if (membership) {
                return membership.role;
            }
        }
        
        if (user.org?.owner_user_id === user.id && user.org.id === vault.org_id) {
            return 'owner';
        }
    }
    
    return null;
}

export function canUserDecrypt(userRole: MemberRole | null): boolean {
    if (!userRole) return false;
    return ROLE_PERMISSIONS[userRole].includes('decrypt');
}

export function canUserEdit(userRole: MemberRole | null): boolean {
    if (!userRole) return false;
    return ROLE_PERMISSIONS[userRole].includes('edit');
}

export function canUserManage(userRole: MemberRole | null): boolean {
    if (!userRole) return false;
    return ROLE_PERMISSIONS[userRole].includes('manage');
}

export function canUserShare(userRole: MemberRole | null): boolean {
    if (!userRole) return false;
    return ROLE_PERMISSIONS[userRole].includes('share');
}
