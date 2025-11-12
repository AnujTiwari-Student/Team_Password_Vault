"use client";

import React from 'react';
import { Key, Shield, Unlock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { toggle2FA } from '@/actions/toggle-2fa';

export const SecurityCenter: React.FC = () => {
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    if (session?.user?.twofa_enabled !== undefined) {
      setIs2FAEnabled(session.user.twofa_enabled);
    }
  }, [session?.user?.twofa_enabled]);

  const handleToggle2FA = async (checked: boolean) => {
    startTransition(async () => {
      try {
        const result = await toggle2FA(checked);
        
        if (result.success) {
          setIs2FAEnabled(checked);
          await update();
          toast.success(result.message);
        } else {
          setIs2FAEnabled(!checked);
          toast.error(result.error || 'Failed to update 2FA settings');
        }
      } catch (error) {
        setIs2FAEnabled(!checked);
        toast.error('An unexpected error occurred');
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Security Center</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Key className="text-blue-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Master Passphrase</h3>
          </div>
          <p className="text-gray-400 mb-4 text-sm">Last changed 45 days ago</p>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Change Master Passphrase
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Shield className={`${is2FAEnabled ? 'text-green-400' : 'text-gray-400'}`} size={24} />
            <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
          </div>
          <p className="text-gray-400 mb-4 text-sm">
            <span className={`font-medium ${is2FAEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {is2FAEnabled ? 'Enabled' : 'Disabled'}
            </span>
            {is2FAEnabled ? ' via Email code' : ' - Add extra security to your account'}
          </p>
          <div className="flex items-center justify-between">
            <Label 
              htmlFor="2fa-toggle" 
              className="text-sm font-medium text-gray-300 cursor-pointer"
            >
              Enable 2FA
            </Label>
            <Switch
              id="2fa-toggle"
              checked={is2FAEnabled}
              onCheckedChange={handleToggle2FA}
              disabled={isPending}
              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-600"
            />
          </div>
          {isPending && (
            <p className="text-xs text-blue-400 mt-2">
              Updating 2FA settings...
            </p>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Unlock className="text-yellow-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Recovery Codes</h3>
          </div>
          <p className="text-gray-400 mb-4 text-sm">
            Generate backup codes to access your account if you lose access to your 2FA device
          </p>
          <button 
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!is2FAEnabled}
          >
            Generate Recovery Codes
          </button>
          {!is2FAEnabled && (
            <p className="text-xs text-gray-500 mt-2">
              Enable 2FA first to generate recovery codes
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
