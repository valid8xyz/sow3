import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { RateAnalysis, TrafficLight } from '../types';

interface Props {
  data: RateAnalysis[];
}

const RateBenchmarkChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 italic">No rate data found in SOW.</div>;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="role" tick={{fontSize: 12}} interval={0} />
          <YAxis label={{ value: 'Daily Rate (AUD)', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value: number, name: string) => [`$${value}`, name === 'sowRate' ? 'SOW Rate' : name]}
          />
          <Legend />
          
          <Bar dataKey="marketMin" stackId="a" fill="transparent" name="Market Min" />
          <Bar dataKey="marketMax" stackId="a" fill="#e2e8f0" name="Market Range" radius={[4, 4, 0, 0]} />
          
          <Bar dataKey="sowRate" name="SOW Quoted Rate" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={
                entry.status === TrafficLight.RED ? '#ef4444' : 
                entry.status === TrafficLight.YELLOW ? '#f59e0b' : '#10b981'
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RateBenchmarkChart;