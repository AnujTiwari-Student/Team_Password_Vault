"use client";

import React from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { AuditLogsTable } from '@/components/audit/AuditLogsTable';
import { SecurityCenter } from '@/components/security/SecurityCenter';
import VaultSetting from '@/components/vaults/VaultSetting';
import { TeamManagement } from '@/components/teams/TeamManagement';
import { OrganizationManagement } from '@/components/org/OrganizationManagement';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { getDashboardData } from '@/lib/dashboard-data';
import type { User } from '@/types/vault';
import type { DashboardTab } from '@/types/dashboard';
import { UnifiedVaultList } from '../vaults/ItemList';

interface DashboardContentProps {
  activeTab: string;
  user: User;
}

const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full animate-fadeIn">{children}</div>
);

export const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  user,
}) => {
  const { recentActivity } = getDashboardData();

  const renderContent = () => {
    switch (activeTab as DashboardTab) {
      case 'Dashboard':
        return <DashboardOverview recentActivity={recentActivity} />;
      
      case 'Items':
      case 'Org Items':
        return <UnifiedVaultList />;
      
      case 'Audits':
        return <AuditLogsTable />;
      
      case 'Security':
        return <SecurityCenter />;
      
      case 'Settings':
        return <VaultSetting />;
      
      case 'Members':
        return <TeamManagement vault={user.vault} user={user} />;
      
      case 'Manage':
        // @ts-expect-error orgId might be undefined
        return <OrganizationManagement user={user} orgId={user.org?.id} />;
      
      case 'Active':
        return <NotificationBadge />;
      
      default:
        return <DashboardOverview recentActivity={recentActivity} />;
    }
  };

  return <ContentWrapper>{renderContent()}</ContentWrapper>;
};
