// ✅ Import from central types file
import {
  MemberRole,
  User,
  Vault,
  Membership,
  VaultPermissions,
} from "@/types/vault";
import { Permission, ROLE_PERMISSIONS } from "@/constants/permission";

/* ---------------------------------- */
/* Shared helper type                  */
/* ---------------------------------- */
export type UserWithMemberships = User & {
  member?: Membership | Membership[];
};

/* ---------------------------------- */
/* Helpers                             */
/* ---------------------------------- */
function normalizeMemberships(
  member?: Membership | Membership[]
): Membership[] {
  if (!member) return [];
  return Array.isArray(member) ? member : [member];
}

export function getMembershipForOrg(
  user: UserWithMemberships | null,
  orgId: string
): Membership | null {
  if (!user) return null;
  
  const memberships = normalizeMemberships(user.member);
  return memberships.find((m) => m.org_id === orgId) ?? null;
}

/* ---------------------------------- */
/* Vault Role                          */
/* ---------------------------------- */
export function getUserRoleInVault(
  user: UserWithMemberships | null,
  vault: Vault | null
): MemberRole | null {
  if (!user || !vault) return null;

  if (vault.type === "personal") {
    return vault.user_id === user.id ? "owner" : null;
  }

  if (vault.type === "org" && vault.org_id) {
    const membership = getMembershipForOrg(user, vault.org_id);
    if (membership) return membership.role;

    if (
      user.org?.owner_user_id === user.id &&
      user.org.id === vault.org_id
    ) {
      return "owner";
    }
  }

  return null;
}

/* ---------------------------------- */
/* Permission checks                   */
/* ---------------------------------- */
function hasPermission(
  role: MemberRole | null,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const canUserDecrypt = (role: MemberRole | null) =>
  hasPermission(role, "decrypt");

export const canUserEdit = (role: MemberRole | null) =>
  hasPermission(role, "edit");

export const canUserManage = (role: MemberRole | null) =>
  hasPermission(role, "manage");

export const canUserShare = (role: MemberRole | null) =>
  hasPermission(role, "share");

export function getUserPermissions(
  role: MemberRole | null
): VaultPermissions {
  return {
    canView: hasPermission(role, "view"),
    canEdit: hasPermission(role, "edit"),
    canDecrypt: hasPermission(role, "decrypt"),
    canManage: hasPermission(role, "manage"),
    canShare: hasPermission(role, "share"),
  };
}

/* ---------------------------------- */
/* Org / Admin helpers                 */
/* ---------------------------------- */
export function isAdmin(user: UserWithMemberships | null): boolean {
  if (!user) return false;

  if (user.org?.owner_user_id === user.id) return true;

  return normalizeMemberships(user.member).some(
    (m) => m.role === "admin" || m.role === "owner"
  );
}

export function isOrgOwner(user: User | null): boolean {
  if (!user) return false;
  return user.org?.owner_user_id === user.id;
}

export function getUserOrgRole(
  user: UserWithMemberships | null,
  orgId: string
): MemberRole | null {
  if (!user) return null;

  const membership = normalizeMemberships(user.member).find(
    (m) => m.org_id === orgId
  );

  return membership?.role ?? null;
}

export function canCreateOrg(user: UserWithMemberships | null): boolean {
  return isAdmin(user) || isOrgOwner(user);
}

export function canManageMembers(
  user: UserWithMemberships | null,
  orgId: string
): boolean {
  const role = getUserOrgRole(user, orgId);
  return role === "owner" || role === "admin";
}
