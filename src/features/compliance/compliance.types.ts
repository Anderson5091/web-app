export type KycTier = 1 | 2 | 3;

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Decision = "APPROVE" | "REVIEW" | "BLOCK";

export interface KycProfile {
  id: string;
  userId: string;
  tier: KycTier;
  status: KycStatus;
  fullName: string;
  country: string;
  dateOfBirth: string;
  address: string;
  selfieUrl?: string;
  createdAt: string;
}

export interface KycDocument {
  id: string;
  documentType: "PASSPORT" | "NATIONAL_ID" | "DRIVER_LICENSE" | "SELFIE";
  fileUrl: string;
  status: KycStatus;
  createdAt: string;
}

export interface AmlCheck {
  id: string;
  riskLevel: RiskLevel;
  flags: string[];
  createdAt: string;
}

export interface SanctionsHit {
  id: string;
  matchName: string;
  listSource: string;
  status: string;
  createdAt: string;
}

export interface RiskScore {
  score: number;
  level: RiskLevel;
  factors: string[];
  updatedAt: string;
}

export interface ComplianceCase {
  id: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  reason: string;
  assignedTo: string;
  createdAt: string;
}

export interface ComplianceOverview {
  kycProfile: KycProfile;
  documents: KycDocument[];
  amlCheck: AmlCheck | null;
  sanctionsHits: SanctionsHit[];
  riskScore: RiskScore;
  recentCases: ComplianceCase[];
  limits: {
    dailySendLimit: number;
    monthlySendLimit: number;
    remainingDaily: number;
    remainingMonthly: number;
  };
}
