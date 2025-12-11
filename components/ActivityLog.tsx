
import React, { useEffect, useState } from 'react';
import { TransactionLog } from '../types';
import { getLogs, clearLogs } from '../services/logService';
import { ScrollText, CheckCircle, XCircle, AlertCircle, Trash2, RotateCw } from 'lucide-react';

export const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<TransactionLog[]>([]);

  const loadLogs = () => {
    setLogs(getLogs());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the activity history?")) {
      clearLogs();
      loadLogs();
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'SUCCESS') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (status === 'FAILURE') return <XCircle className="w-5 h-5 text-rose-500" />;
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <ScrollText className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Activity Log</h2>
            <p className="text-slate-500">History of API requests and responses</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadLogs} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            <RotateCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={handleClear} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No activity recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Timestamp</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Operation</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Reference</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Code</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={log.status} />
                        <span className={`font-medium ${
                          log.status === 'SUCCESS' ? 'text-emerald-700' : 
                          log.status === 'FAILURE' ? 'text-rose-700' : 'text-amber-700'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {log.operation}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {log.reference || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {log.code}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
