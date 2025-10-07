import React from 'react';

interface AuditLog {
  id: number;
  actor: string;
  action: string;
  item: string;
  date: string;
}

interface AuditLogsTableProps {
  auditLogs: AuditLog[];
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-white">Audit Logs</h2>
        
        {/* Filters - Stack on mobile, inline on desktop */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="w-full sm:w-auto px-3 md:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
            <option>All Actors</option>
            <option>john.doe@email.com</option>
            <option>sarah.chen@email.com</option>
          </select>
          <select className="w-full sm:w-auto px-3 md:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
            <option>All Actions</option>
            <option>Password Viewed</option>
            <option>Item Shared</option>
            <option>Item Created</option>
          </select>
          <input
            type="date"
            className="w-full sm:w-auto px-3 md:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="hidden lg:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Actor</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Action</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Item</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="py-4 px-6 text-white text-sm">{log.actor}</td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-sm">{log.item}</td>
                  <td className="py-4 px-6 text-gray-400 text-sm">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-3">
        {auditLogs.map(log => (
          <div
            key={log.id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-3"
          >
            {/* Actor */}
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Actor</span>
              <p className="text-white text-sm mt-1 break-all">{log.actor}</p>
            </div>

            {/* Action */}
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Action</span>
              <div className="mt-1">
                <span className="inline-block px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">
                  {log.action}
                </span>
              </div>
            </div>

            {/* Item */}
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Item</span>
              <p className="text-gray-300 text-sm mt-1">{log.item}</p>
            </div>

            {/* Date & Time */}
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Date & Time</span>
              <p className="text-gray-300 text-sm mt-1">{log.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {auditLogs.length === 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 md:p-12 text-center">
          <p className="text-gray-400 text-sm md:text-base">No audit logs found</p>
        </div>
      )}
    </div>
  );
};