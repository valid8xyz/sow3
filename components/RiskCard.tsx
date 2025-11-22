import React from 'react';
import { ComplianceFinding, TrafficLight } from '../types';

const RiskCard: React.FC<{ finding: ComplianceFinding }> = ({ finding }) => {
  const colors = {
    [TrafficLight.GREEN]: 'bg-green-50 border-green-200 text-green-800',
    [TrafficLight.YELLOW]: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    [TrafficLight.RED]: 'bg-red-50 border-red-200 text-red-800',
  };

  const iconColors = {
    [TrafficLight.GREEN]: 'text-green-500',
    [TrafficLight.YELLOW]: 'text-yellow-500',
    [TrafficLight.RED]: 'text-red-500',
  };

  const icons = {
    [TrafficLight.GREEN]: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    [TrafficLight.YELLOW]: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    [TrafficLight.RED]: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`border rounded-lg p-4 mb-3 flex items-start gap-4 ${colors[finding.status]} transition-all hover:shadow-md`}>
      <div className={`mt-1 ${iconColors[finding.status]}`}>
        {icons[finding.status]}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm uppercase tracking-wider opacity-80 mb-1">{finding.category}</h4>
          {finding.clauseReference && (
            <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">Clause: {finding.clauseReference}</span>
          )}
        </div>
        <p className="font-medium text-lg mb-2">{finding.issue}</p>
        <div className="bg-white/60 p-3 rounded-md text-sm">
          <span className="font-bold block mb-1">Recommendation:</span>
          {finding.recommendation}
        </div>
      </div>
    </div>
  );
};

export default RiskCard;