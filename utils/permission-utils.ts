import { MemberRole, User, Vault, Membership, VaultPermissions } from '@/types/vault';
import { getMembershipForOrg } from './vault-helpers';
import { Permission, ROLE_PERMISSIONS } from '@/constants/permission';

export function getUserRoleInVault(user: User | null, vault: Vault | null): MemberRole | null {
  if (!user || !vault) return null;
  
  if (vault.type === 'personal') {
    return vault.user_id === user.id ? 'owner' : null;
  }
  
  if (vault.type === 'org' && vault.org_id) {
    const membership = getMembershipForOrg(user, vault.org_id);
    
    if (membership) {
      return membership.role;
    }
    
    if (user.org?.owner_user_id === user.id && user.org.id === vault.org_id) {
      return 'owner';
    }
  }
  
  return null;
}

function hasPermission(role: MemberRole | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function canUserDecrypt(userRole: MemberRole | null): boolean {
  return hasPermission(userRole, 'decrypt');
}

export function canUserEdit(userRole: MemberRole | null): boolean {
  return hasPermission(userRole, 'edit');
}

export function canUserManage(userRole: MemberRole | null): boolean {
  return hasPermission(userRole, 'manage');
}

export function canUserShare(userRole: MemberRole | null): boolean {
  return hasPermission(userRole, 'share');
}

export function getUserPermissions(userRole: MemberRole | null): VaultPermissions {
  return {
    canView: hasPermission(userRole, 'view'),
    canEdit: hasPermission(userRole, 'edit'),
    canDecrypt: hasPermission(userRole, 'decrypt'),
    canManage: hasPermission(userRole, 'manage'),
    canShare: hasPermission(userRole, 'share'),
  };
}

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  
  if (user.org?.owner_user_id === user.id) {
    return true;
  }
  
  if (user.member) {
    const memberships = Array.isArray(user.member) ? user.member : [user.member];
    return memberships.some((m: Membership) => m.role === 'admin' || m.role === 'owner');
  }
  
  return false;
}


export function isOrgOwner(user: any): boolean {
  if (!user) return false;
  return user.org?.owner_user_id === user.id;
}

export function getUserOrgRole(user: any, orgId: string): string | null {
  if (!user || !user.member) return null;
  
  const memberships = Array.isArray(user.member) ? user.member : [user.member];
  const membership = memberships.find((m: Membership) => m.org_id === orgId);
  
  return membership?.role || null;
}

export function canCreateOrg(user: any): boolean {
  return isAdmin(user) || isOrgOwner(user);
}

export function canManageMembers(user: any, orgId: string): boolean {
  const role = getUserOrgRole(user, orgId);
  return role === 'owner' || role === 'admin';
}