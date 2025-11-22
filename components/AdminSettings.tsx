
import React, { useState } from 'react';
import { MOCK_TEMPLATES, MOCK_MARKET_RATES, MOCK_COMPANIES } from '../services/mockData';
import { SOWTemplate, GoldenRulesData } from '../types';
import { useAuth } from '../contexts/AuthContext';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'RATES'>('TEMPLATES');
  
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<GoldenRulesData | null>(null);
  const [sourceRef, setSourceRef] = useState('');
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);

  const handleEditClick = (template: SOWTemplate) => {
    setEditingTemplateId(template.id);
    setEditForm({ ...template.currentRules });
    setSourceRef(`Updated by ${user?.name} on ${new Date().toLocaleDateString()}`);
    setViewingHistoryId(null);
  };

  const handleSave = () => {
    if (!editingTemplateId || !editForm) return;
    setTemplates(prev => prev.map(t => {
      if (t.id !== editingTemplateId) return t;
      const newVersion = {
        version: t.versions.length + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'admin',
        sourceRef: sourceRef || 'Manual Update',
        rules: { ...editForm }
      };
      return { ...t, currentRules: newVersion.rules, versions: [newVersion, ...t.versions] };
    }));
    setEditingTemplateId(null);
    setEditForm(null);
  };

  const getCompanyName = (id: string) => MOCK_COMPANIES.find(c => c.id === id)?.name || id;

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="mb-8"><h2 className="text-2xl font-bold text-slate-800">Admin Settings</h2></div>
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button onClick={() => setActiveTab('TEMPLATES')} className={`pb-3 px-4 font-medium border-b-2 ${activeTab === 'TEMPLATES' ? 'border-brand-600' : 'border-transparent'}`}>Golden Rules</button>
        <button onClick={() => setActiveTab('RATES')} className={`pb-3 px-4 font-medium border-b-2 ${activeTab === 'RATES' ? 'border-brand-600' : 'border-transparent'}`}>Market Rates</button>
      </div>
      {activeTab === 'TEMPLATES' && (
        <div className="grid gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div><h3 className="font-bold text-lg">{getCompanyName(template.companyId)} Template</h3><div className="text-sm text-slate-500">{template.division} - v{template.versions.length + 1}</div></div>
                <div className="flex gap-2">
                  <button onClick={() => setViewingHistoryId(viewingHistoryId === template.id ? null : template.id)} className="px-3 py-1.5 border rounded">History</button>
                  {editingTemplateId !== template.id && <button onClick={() => handleEditClick(template)} className="px-3 py-1.5 bg-brand-600 text-white rounded">Edit</button>}
                </div>
              </div>
              {viewingHistoryId === template.id && (
                <div className="bg-slate-50 p-6 border-b border-slate-200">
                  <h4 className="text-sm font-bold mb-3">Version History</h4>
                  {template.versions.map(ver => <div key={ver.version} className="bg-white p-2 mb-2 text-sm rounded border">v{ver.version} - {ver.updatedBy} ({new Date(ver.updatedAt).toLocaleDateString()}) - {ver.sourceRef}</div>)}
                </div>
              )}
              <div className="p-6">
                {editingTemplateId === template.id && editForm ? (
                  <div className="space-y-4">
                    <input value={sourceRef} onChange={e => setSourceRef(e.target.value)} placeholder="Change Reference" className="w-full p-2 border rounded" />
                    <div className="grid grid-cols-2 gap-4">{Object.keys(editForm).map(key => <div key={key}><label className="text-xs font-bold uppercase">{key}</label><textarea value={(editForm as any)[key]} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} className="w-full p-2 border rounded h-24" /></div>)}</div>
                    <div className="flex justify-end gap-2"><button onClick={() => setEditingTemplateId(null)} className="px-4 py-2">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6 text-sm">{Object.entries(template.currentRules).map(([key, val]) => <div key={key}><span className="block text-xs font-bold uppercase text-slate-400">{key}</span><p className="bg-slate-50 p-2 rounded">{val}</p></div>)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'RATES' && <div className="bg-white p-6 rounded border text-center">Market Rates Table View</div>}
    </div>
  );
};

export default AdminSettings;
