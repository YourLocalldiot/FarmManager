export interface CommodityData {
  type: string;
  description: string;
  hsCode: string;
  quantity: number;
  unit: string;
  productionCountry: string;
  productionYear: string;
  companyName: string;
  address: string;
}

export interface SupplyChainActor {
  id: string;
  companyName: string;
  contactName: string;
  role: 'Farmer' | 'Collector' | 'Cooperative' | 'Processor' | 'Exporter' | 'Trader';
  address: string;
  phoneNumber: string;
}

export interface PlotData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  area: number;
  geoJson: any;
}

export interface EvidenceDocument {
  id: string;
  fileUrl: string;
  fileType: string;
  uploadTimestamp: string;
  uploadedBy: string;
  name: string;
}

export interface RiskAssessmentAnswer {
  questionId: string;
  answer: 'Yes' | 'No' | 'Unknown' | '';
  evidenceUrl?: string;
}

export interface MitigationAction {
  id: string;
  riskDescription: string;
  action: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

export interface DeclarationData {
  signatureUrl: string;
  timestamp: string;
  userId: string;
}

export interface BioPassRecord {
  id: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  status: string;
  commodity?: CommodityData;
  supplyChain?: SupplyChainActor[];
  plots?: PlotData[];
  evidence?: EvidenceDocument[];
  riskAssessment?: RiskAssessmentAnswer[];
  mitigation?: MitigationAction[];
  declaration?: DeclarationData;
}
