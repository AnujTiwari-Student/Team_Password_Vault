export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export type VaultType = 'personal' | 'org';
export type ItemType = 'login' | 'note' | 'totp';

export interface APIVaultItem {
  id: string;
  name: string;
  url?: string;
  type: ItemType[];
  tags: string[];
  item_key_wrapped: string;
  username_ct?: string;
  password_ct?: string;
  totp_seed_ct?: string;
  note_ct?: string;
  updated_at: string;
  vault_id: string;
  created_by: string;
}

export interface DecryptedData {
  username?: string;
  password?: string;
  totp_seed?: string;
  note?: string;
}

export interface Vault {
  id: string;
  name: string;
  type: VaultType;
  user_id?: string;
  org_id?: string;
  ovk_cipher?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  vault?: Vault;
  org?: Organization;
  member?: Membership | Membership[];
}

export interface Organization {
  id: string;
  name: string;
  owner_user_id: string;
  vault_id: string;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  org_id: string;
  role: MemberRole;
  ovk_wrapped_for_user: string;
  created_at: string;
  org?: {
    name?: string;
    vaults?: Vault[];
  };
}

export interface VaultPermissions {
  canView: boolean;
  canEdit: boolean;
  canDecrypt: boolean;
  canManage: boolean;
  canShare: boolean;
}
