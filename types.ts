
export enum TrafficLight {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED'
}

export type UserRole = 'ADMIN' | 'AUDITOR' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  companyId?: string;
}

export interface ComplianceFinding {
  category: string;
  status: TrafficLight;
  issue: string;
  recommendation: string;
  clauseReference?: string;
}

export interface RateAnalysis {
  role: string;
  sowRate: number;
  marketMin: number;
  marketMax: number;
  status: TrafficLight;
  flag: string;
}

export interface SOWAnalysisResult {
  clientName: string;
  projectScope: string;
  complianceScore: number;
  overallStatus: TrafficLight;
  findings: ComplianceFinding[];
  rates: RateAnalysis[];
  summary: string;
  missingClauses: string[];
}

export interface Company {
  id: string;
  name: string;
  divisions: string[];
}

export interface GoldenRulesData {
  liability: string;
  paymentTerms: string;
  ipOwnership: string;
  termination: string;
  warranties: string;
  modernSlavery: string;
}

export interface TemplateVersion {
  version: number;
  updatedAt: string;
  updatedBy: string;
  sourceRef: string;
  rules: GoldenRulesData;
}

export interface SOWTemplate {
  id: string;
  companyId: string;
  division?: string;
  currentRules: GoldenRulesData;
  versions: TemplateVersion[];
}

export interface MarketRate {
  id: string;
  role: string;
  category: string;
  baseRateMin: number;
  baseRateMax: number;
  currency: string;
}

export interface RateModifier {
  id: string;
  label: string;
  multiplier: number;
  description: string;
  type: 'LOCATION' | 'HAZARD' | 'SECURITY' | 'SHIFT';
}

export interface SOWVersion {
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  variables: {
    rate: number;
    startDate: string;
    endDate: string;
    modifiers: string[];
    description: string;
    deliverables: string;
  };
}

export interface SOWRecord extends SOWAnalysisResult {
  id: string;
  uploadDate: string;
  uploadedBy: string;
  companyId?: string;
  division?: string;
  role?: string;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'ARCHIVED';
  versions?: SOWVersion[];
}
