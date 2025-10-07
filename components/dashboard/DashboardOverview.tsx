import React from 'react';
import { Lock, Users, Shield, Clock, Plus } from 'lucide-react';

interface RecentActivity {
  action: string;
  item: string;
  time: string;
  user: string;
}

interface DashboardOverviewProps {
  recentActivity: RecentActivity[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ recentActivity }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus size={18} />
          Quick Add
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="text-blue-400" size={24} />
            <h3 className="text-gray-400 text-sm">Total Items</h3>
          </div>
          <p className="text-3xl font-bold text-white">62</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-green-400" size={24} />
            <h3 className="text-gray-400 text-sm">Shared Vaults</h3>
          </div>
          <p className="text-3xl font-bold text-white">3</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-purple-400" size={24} />
            <h3 className="text-gray-400 text-sm">Security Score</h3>
          </div>
          <p className="text-3xl font-bold text-white">87%</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
              <div>
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-sm text-gray-400">{activity.item} • {activity.user}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};