// @ts-expect-error ignore-next-line
import { RecentActivity, AuditLog } from '@/types/dashboard';

export const getDashboardData = () => {
  const recentActivity: RecentActivity[] = [
    { action: 'Password updated', item: 'GitHub', time: '2 hours ago', user: 'You' },
    { action: 'Item shared', item: 'AWS Console', time: '5 hours ago', user: 'Sarah Chen' },
    { action: 'New item added', item: 'Stripe Dashboard', time: '1 day ago', user: 'You' }
  ];

  const auditLogs: AuditLog[] = [
    { id: 1, actor: 'john.doe@email.com', action: 'Password Viewed', item: 'GitHub', date: '2025-10-06 14:32' },
    { id: 2, actor: 'sarah.chen@email.com', action: 'Item Shared', item: 'AWS Console', date: '2025-10-06 09:15' },
    { id: 3, actor: 'john.doe@email.com', action: 'Item Created', item: 'Stripe Dashboard', date: '2025-10-05 16:45' },
    { id: 4, actor: 'admin@company.com', action: 'Vault Created', item: 'Banking', date: '2025-04-04 11:20' }
  ];

  return { recentActivity, auditLogs };
};
