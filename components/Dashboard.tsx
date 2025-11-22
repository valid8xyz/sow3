
import React from 'react';
import { SOWAnalysisResult, TrafficLight } from '../types';
import RiskCard from './RiskCard';
import RateBenchmarkChart from './RateBenchmarkChart';

interface Props {
  analysis: SOWAnalysisResult;
  onReset: () => void;
}

const Dashboard: React.FC<Props> = ({ analysis, onReset }) => {
  const scoreColor = 
    analysis.complianceScore >= 80 ? 'text-green-600' : 
    analysis.complianceScore >= 50 ? 'text-yellow-600' : 'text-red-600';

  const scoreBg = 
    analysis.complianceScore >= 80 ? 'bg-green-100' : 
    analysis.complianceScore >= 50 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{analysis.clientName || 'Client'} SOW Review</h2>
          <p className="text-slate-500">Project: {analysis.projectScope}</p>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Compliance Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-bold ${scoreColor}`}>{analysis.complianceScore}</span>
              <span className="text-slate-400">/100</span>
            </div>
          </div>
          <div className={`h-16 w-16 rounded-full flex items-center justify-center ${scoreBg}`}>
            <svg className={`w-8 h-8 ${scoreColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Risk Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Risk Profile</p>
          <div className="flex gap-2">
            <div className={`flex-1 h-3 rounded-full ${analysis.overallStatus === 'GREEN' ? 'bg-green-500' : 'bg-slate-100'}`}></div>
            <div className={`flex-1 h-3 rounded-full ${analysis.overallStatus === 'YELLOW' ? 'bg-yellow-500' : 'bg-slate-100'}`}></div>
            <div className={`flex-1 h-3 rounded-full ${analysis.overallStatus === 'RED' ? 'bg-red-500' : 'bg-slate-100'}`}></div>
          </div>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            Status: {analysis.overallStatus} - {analysis.findings.filter(f => f.status === TrafficLight.RED).length} Critical Issues
          </p>
        </div>

        {/* Missing Clauses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Gap Analysis</p>
          {analysis.missingClauses.length > 0 ? (
            <ul className="space-y-1">
              {analysis.missingClauses.map((clause, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-red-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Missing: {clause}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              All mandatory clauses present
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Findings */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Detailed Findings
          </h3>
          <div className="space-y-3">
            {analysis.findings.map((finding, index) => (
              <RiskCard key={index} finding={finding} />
            ))}
          </div>
        </div>

        {/* Right Column: Rates & Summary */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Rate Benchmarking
            </h3>
            <RateBenchmarkChart data={analysis.rates} />
            <div className="mt-4 space-y-2">
              {analysis.rates.map((rate, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span className="font-medium text-slate-700">{rate.role}</span>
                  <span className={`font-bold ${
                    rate.status === 'RED' ? 'text-red-600' : 
                    rate.status === 'YELLOW' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    ${rate.sowRate} ({rate.flag})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">AI Summary</h3>
            <p className="text-blue-800 leading-relaxed text-sm">{analysis.summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
