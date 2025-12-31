import { ITEM_TYPE_COLORS, ROLE_COLORS } from '@/constants/permission';
import { MemberRole, ItemType } from '@/types/vault';

export function getRoleBadgeColor(role: MemberRole | null): string {
  if (!role) return ROLE_COLORS.viewer;
  return ROLE_COLORS[role] || ROLE_COLORS.viewer;
}

export function getItemTypeColor(type: ItemType): string {
  return ITEM_TYPE_COLORS[type] || ITEM_TYPE_COLORS.default;
}

export function getMultiTypeColor(types: ItemType[]): string {
  if (types.length === 1) {
    return getItemTypeColor(types[0]);
  }
  return 'bg-gradient-to-r from-blue-900/30 to-green-900/30 text-white border-blue-700/30';
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function sanitizeItemName(name: string): string {
  return name.trim().slice(0, 100);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getMembershipForOrg(
  user: { member?: any | any[] },
  orgId: string
) {
  if (!user.member) return null;
  
  const memberships = Array.isArray(user.member) ? user.member : [user.member];
  return memberships.find((m: any) => m.org_id === orgId) || null;
}
