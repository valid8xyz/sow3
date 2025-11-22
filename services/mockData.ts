
import { SOWRecord, TrafficLight, Company, SOWTemplate, MarketRate, RateModifier } from '../types';

export const MOCK_COMPANIES: Company[] = [
  { id: 'comp-001', name: 'Transurban', divisions: ['Corporate', 'Technology', 'Operations'] },
  { id: 'comp-002', name: 'BHP', divisions: ['Minerals Australia', 'Technology', 'HSE'] },
  { id: 'comp-003', name: 'Commonwealth Bank', divisions: ['Retail Banking', 'Technology', 'Risk'] },
  { id: 'comp-004', name: 'Telstra', divisions: ['Networks', 'Enterprise', 'InfraCo'] }
];

export const MOCK_MARKET_RATES: MarketRate[] = [
  { id: 'rate-001', role: 'Senior Test Analyst', category: 'Technology', baseRateMin: 800, baseRateMax: 1100, currency: 'AUD' },
  { id: 'rate-002', role: 'Scrum Master', category: 'Technology', baseRateMin: 950, baseRateMax: 1350, currency: 'AUD' },
  { id: 'rate-003', role: 'Solution Architect', category: 'Technology', baseRateMin: 1400, baseRateMax: 1900, currency: 'AUD' },
  { id: 'rate-004', role: 'Site Nurse', category: 'HSE', baseRateMin: 600, baseRateMax: 900, currency: 'AUD' },
  { id: 'rate-005', role: 'Project Manager', category: 'Technology', baseRateMin: 1100, baseRateMax: 1500, currency: 'AUD' },
  { id: 'rate-006', role: 'Network Engineer', category: 'Technology', baseRateMin: 900, baseRateMax: 1200, currency: 'AUD' },
  { id: 'rate-007', role: 'Security Consultant', category: 'Technology', baseRateMin: 1200, baseRateMax: 1600, currency: 'AUD' }
];

export const MOCK_RATE_MODIFIERS: RateModifier[] = [
  { id: 'mod-fifo', label: 'FIFO / Remote', multiplier: 1.25, description: 'Remote location hardship.', type: 'LOCATION' },
  { id: 'mod-hazard', label: 'Hazardous Env', multiplier: 1.15, description: 'Underground/Dangerous work.', type: 'HAZARD' },
  { id: 'mod-clearance', label: 'NV1 Clearance', multiplier: 1.10, description: 'Security clearance required.', type: 'SECURITY' }
];

export const MOCK_TEMPLATES: SOWTemplate[] = [
  {
    id: 'temp-transurban-tech',
    companyId: 'comp-001',
    division: 'Technology',
    currentRules: {
      liability: 'Cap must be minimum $20M AUD per occurrence.',
      paymentTerms: '30 days from end of month.',
      ipOwnership: 'All IP created vests immediately in Transurban.',
      termination: 'Termination for convenience with 14 days notice.',
      warranties: 'Services performed with due care and skill.',
      modernSlavery: 'Must comply with Modern Slavery Act 2018 (Cth).'
    },
    versions: [
      {
        version: 1,
        updatedAt: '2023-01-01T00:00:00Z',
        updatedBy: 'system',
        sourceRef: 'Procurement Policy v1.0',
        rules: {
          liability: 'Cap minimum $10M.',
          paymentTerms: '30 days.',
          ipOwnership: 'IP vests in Client.',
          termination: '30 days notice.',
          warranties: 'Standard.',
          modernSlavery: 'Required.'
        }
      }
    ]
  },
  {
    id: 'temp-bhp-mining',
    companyId: 'comp-002',
    division: 'Minerals Australia',
    currentRules: {
      liability: 'Unlimited liability for safety/environmental breaches.',
      paymentTerms: '45 days standard.',
      ipOwnership: 'BHP owns all data and reports.',
      termination: 'Immediate termination for HSE violations.',
      warranties: 'Compliance with Site Safety Standards mandatory.',
      modernSlavery: 'Mandatory supply chain reporting.'
    },
    versions: []
  }
];

export const MOCK_SOW_HISTORY: SOWRecord[] = [
  {
    id: 'sow-001',
    uploadDate: '2024-01-15T09:00:00Z',
    uploadedBy: 'user@example.com',
    companyId: 'comp-001',
    division: 'Technology',
    role: 'Senior Test Analyst',
    clientName: 'Transurban',
    projectScope: 'Integrated Business Planning',
    complianceScore: 85,
    overallStatus: TrafficLight.YELLOW,
    summary: 'Generally compliant but missing specific liability caps.',
    missingClauses: ['Mining Division HSE Specifics'],
    findings: [{ category: 'Liability', status: TrafficLight.YELLOW, issue: 'Cap is $10M', recommendation: 'Increase to $20M', clauseReference: '12.1' }],
    rates: [{ role: 'Senior Test Analyst', sowRate: 1200, marketMin: 800, marketMax: 1100, status: TrafficLight.YELLOW, flag: 'High' }],
    versions: []
  },
  {
    id: 'sow-002',
    uploadDate: '2024-02-10T14:30:00Z',
    uploadedBy: 'auditor@example.com',
    companyId: 'comp-002',
    division: 'HSE',
    role: 'Site Nurse',
    clientName: 'BHP',
    projectScope: 'Site Nurse Staffing',
    complianceScore: 95,
    overallStatus: TrafficLight.GREEN,
    summary: 'Strong compliance. Rates align with Nurses Award.',
    missingClauses: [],
    findings: [],
    rates: [{ role: 'Site Nurse', sowRate: 750, marketMin: 600, marketMax: 900, status: TrafficLight.GREEN, flag: 'Within Market' }],
    versions: []
  }
];
