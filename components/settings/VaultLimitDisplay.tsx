import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle } from 'lucide-react';
import { Vault, User } from '@/types/vault';
import { PlanType } from '@/types/billing';

interface VaultStats {
  itemCount: number;
  vaultCount: number;
  memberCount: number;
}

interface VaultLimitsDisplayProps {
  vault: Vault;
  user: User;
}

export const VaultLimitsDisplay: React.FC<VaultLimitsDisplayProps> = ({ vault, user }) => {
  const [stats, setStats] = useState<VaultStats>({
    itemCount: 0,
    vaultCount: 1,
    memberCount: 1
  });
  const [loading, setLoading] = useState<boolean>(true);

  const userPlan: PlanType = 'free'; 

  const getPlanLimits = (plan: PlanType, vaultType: 'personal' | 'org') => {
    const limits = {
      free: { vaults: 1, items: 5, members: 1 },
      personal_pro: { vaults: 5, items: 1000, members: 1 },
      org_basic: { vaults: 3, items: 500, members: 10 },
      org_pro: { vaults: 10, items: 2000, members: 50 },
      enterprise: { vaults: 999, items: 10000, members: 999 }
    };

    // @ts-expect-error Todo: Type missmatch
    return limits[plan];
  };

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/vault/${vault.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch vault stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [vault.id]);

  const limits = getPlanLimits(userPlan, vault.type);

  const getUsageColor = (used: number, limit: number): string => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressColor = (used: number, limit: number): string => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700/50 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700/50 rounded"></div>
            <div className="h-4 bg-gray-700/50 rounded"></div>
            <div className="h-4 bg-gray-700/50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Database className="w-5 h-5" />
        Usage & Limits
      </h3>
      
      <div className="space-y-6">
        {/* Plan Info */}
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div>
            <p className="font-medium text-white">Current Plan</p>
            <p className="text-sm text-gray-400 capitalize">{userPlan.replace('_', ' ')}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs border ${
            userPlan === 'free' 
              ? 'bg-gray-900/30 text-gray-300 border-gray-700/30'
              : 'bg-blue-900/30 text-blue-300 border-blue-700/30'
          }`}>
            {userPlan === 'free' ? 'Free' : 'Pro'}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-4">
          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Vault Items</span>
              <span className={`text-sm font-medium ${getUsageColor(stats.itemCount, limits.items)}`}>
                {stats.itemCount} / {limits.items}
              </span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stats.itemCount, limits.items)}`}
                style={{ width: `${Math.min((stats.itemCount / limits.items) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Vaults (for personal accounts) */}
          {vault.type === 'personal' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Total Vaults</span>
                <span className={`text-sm font-medium ${getUsageColor(stats.vaultCount, limits.vaults)}`}>
                  {stats.vaultCount} / {limits.vaults}
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stats.vaultCount, limits.vaults)}`}
                  style={{ width: `${Math.min((stats.vaultCount / limits.vaults) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Members (for org accounts) */}
          {vault.type === 'org' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Organization Members</span>
                <span className={`text-sm font-medium ${getUsageColor(stats.memberCount, limits.members)}`}>
                  {stats.memberCount} / {limits.members}
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stats.memberCount, limits.members)}`}
                  style={{ width: `${Math.min((stats.memberCount / limits.members) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Warnings */}
        {(stats.itemCount / limits.items) >= 0.9 && (
          <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-medium">Item Limit Warning</p>
              <p className="text-sm text-red-200">
                Youre approaching your item limit. Consider upgrading your plan to add more items.
              </p>
            </div>
          </div>
        )}

        {userPlan === 'free' && (
          <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-300 font-medium">Free Plan Limits</p>
              <p className="text-sm text-blue-200">
                Upgrade to Pro to get unlimited items, multiple vaults, and advanced features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
