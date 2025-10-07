"use client";

import React, { useState, useTransition } from 'react';
import { redirect } from 'next/navigation';
import { logout } from '@/actions/logout';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import { TopNav } from '@/components/layout/TopNav';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { VaultsList } from '@/components/vaults/VaultsList';
import { VaultItemTable } from '@/components/vaults/VaultItemTable';
import { AuditLogsTable } from '@/components/audit/AuditLogsTable';
import { SecurityCenter } from '@/components/security/SecurityCenter';
import { ItemDrawer } from '@/components/modals/ItemDrawer';
import { ShareDialog } from '@/components/modals/ShareDialog';
// import { Sidebar } from '@/components/layout/Sidebar';

interface Item {
  id: number;
  name: string;
  url: string;
  username: string;
  password: string;
  totp: string;
  vault: number;
}

interface Vault {
  id: number;
  name: string;
  items: number;
  shared: boolean;
}

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


// Mock Data (as defined in the original component)
const orgs = ['Personal Vault', 'Work Team', 'Family Shared'];
  
const vaults: Vault[] = [
  { id: 1, name: 'Personal', items: 24, shared: false },
  { id: 2, name: 'Work Accounts', items: 18, shared: true },
  { id: 3, name: 'Banking', items: 8, shared: false },
  { id: 4, name: 'Social Media', items: 12, shared: false }
];

const items: Item[] = [
  { id: 1, name: 'GitHub', url: 'github.com', username: 'john.doe@email.com', password: 'SecureP@ss123!', totp: '847293', vault: 1 },
  { id: 2, name: 'AWS Console', url: 'aws.amazon.com', username: 'admin@company.com', password: 'AWS#Secure456', totp: '123456', vault: 2 },
  { id: 3, name: 'Gmail', url: 'mail.google.com', username: 'personal@gmail.com', password: 'GooglePass789!', totp: '654321', vault: 1 }
];

const recentActivity: RecentActivity[] = [
  { action: 'Password updated', item: 'GitHub', time: '2 hours ago', user: 'You' },
  { action: 'Item shared', item: 'AWS Console', time: '5 hours ago', user: 'Sarah Chen' },
  { action: 'New item added', item: 'Stripe Dashboard', time: '1 day ago', user: 'You' }
];

const auditLogs: AuditLog[] = [
  { id: 1, actor: 'john.doe@email.com', action: 'Password Viewed', item: 'GitHub', date: '2025-10-06 14:32' },
  { id: 2, actor: 'sarah.chen@email.com', action: 'Item Shared', item: 'AWS Console', date: '2025-10-06 09:15' },
  { id: 3, actor: 'john.doe@email.com', action: 'Item Created', item: 'Stripe Dashboard', date: '2025-10-05 16:45' },
  { id: 4, actor: 'admin@company.com', action: 'Vault Created', item: 'Banking', date: '2025-10-04 11:20' }
];

const DashboardPage = () => {
  const [isPending, startTransition] = useTransition();
  const user = useCurrentUser();

  const handleLogout = async () => {
    try {
      startTransition(async () => {
        await logout();
      });
    } catch (error) {
      console.error("Error during logout:", error);
      redirect('/dashboard');
    }
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: number]: boolean }>({});
  const [currentOrg, setCurrentOrg] = useState('Personal Vault');

  const togglePasswordReveal = (itemId: number) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading User Data...</div>
      </div>
    );
  }

  if (user && !user.masterPassphraseSetupComplete) {
    redirect('/setup/master-passphrase');
    return null;
  }


  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview recentActivity={recentActivity} />;
      case 'vaults':
        return (
          <>
            <VaultsList vaults={vaults} setSelectedVault={setSelectedVault} />
            {selectedVault && (
              <VaultItemTable
                selectedVault={selectedVault}
                items={items}
                setSelectedItem={setSelectedItem}
                setShareDialogOpen={setShareDialogOpen}
              />
            )}
          </>
        );
      case 'audit':
        return <AuditLogsTable auditLogs={auditLogs} />;
      case 'security':
        return <SecurityCenter />;
      default:
        return <DashboardOverview recentActivity={recentActivity} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Navigation */}
      {/* <TopNav
      // @ts-expect-error Server Component
        user={user}
        orgs={orgs}
        currentOrg={currentOrg}
        setCurrentOrg={setCurrentOrg}
        handleLogout={handleLogout}
        isPending={isPending}
      /> */}

      <div className="flex">
        {/* Sidebar */}
        {/* <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} /> */}

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderMainContent()}
        </main>
      </div>

      {/* Modals and Drawers (Global Overlays) */}
      <ItemDrawer
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        revealedPasswords={revealedPasswords}
        togglePasswordReveal={togglePasswordReveal}
        copyToClipboard={copyToClipboard}
      />
      
      <ShareDialog
        shareDialogOpen={shareDialogOpen}
        setShareDialogOpen={setShareDialogOpen}
      />
    </div>
  );
};

export default DashboardPage;