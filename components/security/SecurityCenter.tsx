import React from 'react';
import { Key, Shield, Unlock } from 'lucide-react';

export const SecurityCenter: React.FC = () => {
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
            <Shield className="text-green-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
          </div>
          <p className="text-gray-400 mb-4 text-sm">
            <span className="text-green-400 font-medium">Enabled</span> via Authenticator App
          </p>
          <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Manage 2FA
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Unlock className="text-yellow-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Recovery Codes</h3>
          </div>
          <p className="text-gray-400 mb-4 text-sm">
            Generate backup codes to access your account if you lose access to your 2FA device
          </p>
          <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
            Generate Recovery Codes
          </button>
        </div>
      </div>
    </div>
  );
};