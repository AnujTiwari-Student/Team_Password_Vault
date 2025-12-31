export interface RecentActivity {
  action: string;
  item: string;
  time: string;
  user: string;
}

export interface AuditLog {
  id: number;
  actor: string;
  action: string;
  item: string;
  date: string;
}

export type DashboardTab = 
  | 'Dashboard'
  | 'Items'
  | 'Org Items'
  | 'Audits'
  | 'Security'
  | 'Settings'
  | 'Members'
  | 'Manage'
  | 'Active';
