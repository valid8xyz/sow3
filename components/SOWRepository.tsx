
import React, { useState, useMemo } from 'react';
import { SOWRecord, TrafficLight } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onViewSOW: (sow: SOWRecord) => void;
  data: SOWRecord[];
}

const SOWRepository: React.FC<Props> = ({ onViewSOW, data }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (user?.role === 'USER' && item.uploadedBy !== user.email) return false;
      const matchesText = item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || item.projectScope.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || item.overallStatus === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [searchTerm, statusFilter, user, data]);

  const getStatusBadge = (status: TrafficLight) => {
    const styles = { [TrafficLight.GREEN]: 'bg-green-100 text-green-800', [TrafficLight.YELLOW]: 'bg-yellow-100 text-yellow-800', [TrafficLight.RED]: 'bg-red-100 text-red-800' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">SOW Repository</h2>
        <div className="text-sm text-slate-500">Showing {filteredData.length} records</div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-2 border rounded bg-white">
          <option value="ALL">All Statuses</option><option value="GREEN">Green</option><option value="YELLOW">Yellow</option><option value="RED">Red</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th><th className="px-6 py-3"></th></tr></thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredData.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4"><div>{item.clientName}</div><div className="text-xs text-slate-500">{item.projectScope}</div></td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.uploadDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{getStatusBadge(item.overallStatus)}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => onViewSOW(item)} className="text-brand-600 hover:text-brand-900 font-medium">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SOWRepository;
