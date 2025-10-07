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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
            <option>All Actors</option>
            <option>john.doe@email.com</option>
            <option>sarah.chen@email.com</option>
          </select>
          <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
            <option>All Actions</option>
            <option>Password Viewed</option>
            <option>Item Shared</option>
            <option>Item Created</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
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
                <td className="py-4 px-6 text-white">{log.actor}</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">
                    {log.action}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-400">{log.item}</td>
                <td className="py-4 px-6 text-gray-400">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};