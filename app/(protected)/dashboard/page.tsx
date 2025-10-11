"use client";

import React, { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ItemList } from '@/components/vaults/ItemList';
import { AuditLogsTable } from '@/components/audit/AuditLogsTable';
import { SecurityCenter } from '@/components/security/SecurityCenter';
import { AppSidebar } from '@/components/ui/app-sidebar'; 
import { SidebarTrigger } from '@/components/ui/sidebar';
import VaultSetting from '@/components/vaults/VaultSetting'
import { BillingComponent } from '@/components/settings/BillingComponent';
import { TeamManagement } from '@/components/teams/TeamManagement';

interface AuditLog {
  id: number;
  actor: string;
  action: string;
  item: string;
  date: string;
}

interface RecentActivity {
  action: string;
  item: string;
  time: string;
  user: string;
}

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

const DashboardPage = () => {
  
  const user = useCurrentUser();

  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    if (user && !user.masterPassphraseSetupComplete) {
      redirect('/setup/master-passphrase');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading User Data...</div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardOverview recentActivity={recentActivity} />;
      case 'Items':
        return <ItemList />;
      case 'Audits':
        return <AuditLogsTable auditLogs={auditLogs} />;
      case 'Security':
        return <SecurityCenter />;
      case 'Settings':
        return <VaultSetting />
      case "Members":
        // @ts-expect-error Todo: Type missmatch
        return <TeamManagement vault={user.vault} user={user} />
      default:
        return <DashboardOverview recentActivity={recentActivity} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <SidebarTrigger className='relative' />
      <main className="flex-1 px-2 py-8 -ml-6 mr-1 md:px-8 md:py-8 md:mr-2 w-max">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default DashboardPage; 