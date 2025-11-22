import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Login from './components/Login';
import SOWRepository from './components/SOWRepository';
import SOWBuilder from './components/SOWBuilder';
import AdminSettings from './components/AdminSettings';
import LiveAssistant from './components/LiveAssistant';
import { analyzeSOW } from './services/geminiService';
import { SOWAnalysisResult, SOWRecord } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MOCK_SOW_HISTORY } from './services/mockData';

type ViewState = 'NEW' | 'REPO' | 'DETAILS' | 'BUILDER' | 'ADMIN';

const MainContent = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('NEW');
  const [analysis, setAnalysis] = useState<SOWAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sowHistory, setSowHistory] = useState<SOWRecord[]>(MOCK_SOW_HISTORY);

  if (!isAuthenticated) return <Login />;

  const handleUpload = async (base64File: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await analyzeSOW(base64File);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSOW = (newRecord: SOWRecord) => {
    setSowHistory(prev => [newRecord, ...prev]);
    setAnalysis(newRecord);
    setCurrentView('DETAILS');
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view === 'NEW') setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      <Header currentView={currentView === 'DETAILS' ? 'REPO' : currentView} onNavigate={handleNavigate} />
      <main className="py-10 px-4">
        {error && <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
        {currentView === 'REPO' && <SOWRepository onViewSOW={(r) => { setAnalysis(r); setCurrentView('DETAILS'); }} data={sowHistory} />}
        {currentView === 'BUILDER' && <SOWBuilder onSave={handleSaveSOW} onCancel={() => setCurrentView('REPO')} />}
        {currentView === 'ADMIN' && <AdminSettings />}
        {(currentView === 'NEW' || currentView === 'DETAILS') && (
          !analysis ? <div className="flex items-center justify-center min-h-[60vh]"><FileUpload onUpload={handleUpload} isProcessing={isProcessing} /></div> : <Dashboard analysis={analysis} onReset={() => { setAnalysis(null); setCurrentView('NEW'); }} />
        )}
      </main>
      <LiveAssistant />
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <MainContent />
  </AuthProvider>
);

export default App;
