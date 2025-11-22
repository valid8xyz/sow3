
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_COMPANIES, MOCK_MARKET_RATES, MOCK_RATE_MODIFIERS } from '../services/mockData';
import { generateSOWContent } from '../services/geminiService';
import { SOWRecord, SOWVersion, TrafficLight } from '../types';

interface Props {
  onSave: (record: SOWRecord) => void;
  onCancel: () => void;
}

const SOWBuilder: React.FC<Props> = ({ onSave, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedCompanyId, setSelectedCompanyId] = useState(user?.companyId || MOCK_COMPANIES[0].id);
  const [selectedDivision, setSelectedDivision] = useState(MOCK_COMPANIES[0].divisions[0]);
  const [selectedRole, setSelectedRole] = useState(MOCK_MARKET_RATES[0].role);

  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [calculatedMin, setCalculatedMin] = useState(0);
  const [calculatedMax, setCalculatedMax] = useState(0);
  const [userRate, setUserRate] = useState<number>(0);

  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompanyId(e.target.value);
    const comp = MOCK_COMPANIES.find(c => c.id === e.target.value);
    if (comp) setSelectedDivision(comp.divisions[0]);
  };

  useEffect(() => {
    const marketRate = MOCK_MARKET_RATES.find(r => r.role === selectedRole);
    if (marketRate) {
      let multiplier = 1.0;
      selectedModifiers.forEach(modId => {
        const mod = MOCK_RATE_MODIFIERS.find(m => m.id === modId);
        if (mod) multiplier += (mod.multiplier - 1);
      });
      setCalculatedMin(Math.round(marketRate.baseRateMin * multiplier));
      setCalculatedMax(Math.round(marketRate.baseRateMax * multiplier));
      if (userRate === 0) setUserRate(Math.round((marketRate.baseRateMin + marketRate.baseRateMax) / 2 * multiplier));
    }
  }, [selectedRole, selectedModifiers]);

  const toggleModifier = (modId: string) => {
    if (selectedModifiers.includes(modId)) setSelectedModifiers(prev => prev.filter(id => id !== modId));
    else setSelectedModifiers(prev => [...prev, modId]);
  };

  const getRateStatus = () => {
    if (userRate < calculatedMin * 0.8) return { color: 'text-yellow-600', text: 'Below Market Risk' };
    if (userRate > calculatedMax * 1.2) return { color: 'text-red-600', text: 'Significantly Above Market' };
    if (userRate > calculatedMax) return { color: 'text-yellow-600', text: 'Slightly Above Market' };
    return { color: 'text-green-600', text: 'Fair Market Range' };
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    const companyName = MOCK_COMPANIES.find(c => c.id === selectedCompanyId)?.name || '';
    const result = await generateSOWContent(companyName, selectedDivision, selectedRole);
    setDescription(result.description);
    setDeliverables(result.deliverables);
    setIsGenerating(false);
    setStep(4);
  };

  const handleFinalize = () => {
    const company = MOCK_COMPANIES.find(c => c.id === selectedCompanyId)!;
    const version: SOWVersion = {
      versionNumber: 1,
      createdAt: new Date().toISOString(),
      createdBy: user?.email || 'unknown',
      variables: { rate: userRate, startDate, endDate, modifiers: selectedModifiers, description, deliverables }
    };
    const newRecord: SOWRecord = {
      id: `sow-${Date.now()}`,
      uploadDate: new Date().toISOString(),
      uploadedBy: user?.email || 'unknown',
      companyId: selectedCompanyId,
      division: selectedDivision,
      role: selectedRole,
      status: 'DRAFT',
      clientName: company.name,
      projectScope: `SOW for ${selectedRole}`,
      complianceScore: 100,
      overallStatus: TrafficLight.GREEN,
      summary: 'Auto-generated via SOW Maker.',
      missingClauses: [],
      findings: [],
      rates: [{
        role: selectedRole,
        sowRate: userRate,
        marketMin: calculatedMin,
        marketMax: calculatedMax,
        status: getRateStatus().color.includes('red') ? TrafficLight.RED : TrafficLight.GREEN,
        flag: getRateStatus().text
      }],
      versions: [version]
    };
    onSave(newRecord);
  };

  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
        <select value={selectedCompanyId} onChange={handleCompanyChange} disabled={user?.role === 'USER'} className="w-full p-3 border rounded-lg bg-white">
          {MOCK_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Division</label>
        <select value={selectedDivision} onChange={e => setSelectedDivision(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
          {MOCK_COMPANIES.find(c => c.id === selectedCompanyId)?.divisions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
        <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
          {MOCK_MARKET_RATES.map(r => <option key={r.id} value={r.role}>{r.role} ({r.category})</option>)}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-1">Rate Wizard</h3>
        <p className="text-sm text-blue-700">Adjusting for {selectedRole}. Base: ${MOCK_MARKET_RATES.find(r => r.role === selectedRole)?.baseRateMin}-${MOCK_MARKET_RATES.find(r => r.role === selectedRole)?.baseRateMax}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MOCK_RATE_MODIFIERS.map(mod => (
          <div key={mod.id} onClick={() => toggleModifier(mod.id)} className={`p-3 rounded-lg border cursor-pointer ${selectedModifiers.includes(mod.id) ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200'}`}>
            <div className="flex justify-between"><span className="font-medium">{mod.label}</span><span className="text-xs bg-white px-2 py-1 rounded border">+{Math.round((mod.multiplier - 1) * 100)}%</span></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Your Rate</label>
          <input type="number" value={userRate} onChange={e => setUserRate(Number(e.target.value))} className="w-full p-3 border rounded-lg font-mono text-lg" />
          <p className={`text-sm mt-1 font-medium ${getRateStatus().color}`}>{getRateStatus().text}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border">
          <span className="text-xs text-slate-500 uppercase font-bold">Fair Range</span>
          <div className="text-2xl font-bold text-slate-800">${calculatedMin} - ${calculatedMax}</div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Start</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium mb-1">End</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
      </div>
      {isGenerating ? (
        <div className="py-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div><p>Drafting SOW...</p></div>
      ) : (
        <div className="text-center py-8">
           <button onClick={handleGenerateContent} className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 shadow-md">Generate SOW Content</button>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div><label className="block text-sm font-medium mb-1">Services</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 border rounded-lg h-32" /></div>
      <div><label className="block text-sm font-medium mb-1">Deliverables</label><textarea value={deliverables} onChange={e => setDeliverables(e.target.value)} className="w-full p-4 border rounded-lg h-32" /></div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-900 text-sm font-medium">Golden Rules Applied: Liability Caps, IP Ownership, Payment Terms.</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8"><h2 className="text-3xl font-bold text-slate-900">SOW Builder</h2></div>
      <div className="flex justify-between mb-8 px-4">{[1, 2, 3, 4].map(s => <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= s ? 'border-brand-500 text-brand-700 bg-white' : 'border-slate-200 text-slate-400'}`}>{s}</div>)}</div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={step === 1 ? onCancel : () => setStep(s => s - 1)} className="px-6 py-2 text-slate-600">Back</button>
        {step < 4 ? <button onClick={() => setStep(s => s + 1)} className="px-6 py-2 bg-brand-600 text-white rounded-lg">Next</button> : <button onClick={handleFinalize} className="px-6 py-2 bg-green-600 text-white rounded-lg">Finish</button>}
      </div>
    </div>
  );
};

export default SOWBuilder;
