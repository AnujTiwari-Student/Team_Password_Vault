export interface User {
  id: string;
  email: string;
  account_type: 'personal' | 'org';
  vault?: Vault;
  org?: Organization;
  member?: Membership | Membership[];
}

export interface Vault {
  id: string;
  name: string;
  type: 'personal' | 'org';
  user_id?: string;
  org_id?: string;
}

export interface Organization {
  id: string;
  name: string;
  owner_user_id: string;
}

export interface Membership {
  id: string;
  user_id: string;
  org_id: string;
  role: MemberRole;
}

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export type TargetType = 'vault' | 'item';
export type Permission = 'view' | 'edit' | 'share' | 'manage' | 'decrypt';

export interface APIVaultItem {
  id: string;
  name: string;
  url?: string;
  type: string[];
  tags: string[];
  item_key_wrapped: string;
  username_ct?: string;
  password_ct?: string;
  totp_seed_ct?: string;
  note_ct?: string;
  updated_at: string;
}

export interface DecryptedData {
  username?: string;
  password?: string;
  totp_seed?: string;
  note?: string;
}
