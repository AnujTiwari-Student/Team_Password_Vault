// Ensure your Membership type has all required properties
export type MemberRole = "owner" | "admin" | "member" | "viewer";

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  updated_at: string;
  // Add any other properties your Membership needs
}

export interface User {
  id: string;
  email: string;
  name?: string;
  org?: {
    id: string;
    owner_user_id: string;
  };
  // Add other user properties
}

export interface Vault {
  id: string;
  name: string;
  type: "personal" | "org";
  user_id?: string;
  org_id?: string;
  // Add other vault properties
}

export interface VaultPermissions {
  canView: boolean;
  canEdit: boolean;
  canDecrypt: boolean;
  canManage: boolean;
  canShare: boolean;
}
