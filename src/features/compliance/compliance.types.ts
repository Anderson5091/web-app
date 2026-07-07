export type KycTier = 1 | 2 | 3;

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Decision = "APPROVE" | "REVIEW" | "BLOCK";

export interface KycProfile {
  id: string;
  userId: string;
  tier: number;
  status: string;
  fullName: string;
  country: string;
  dateOfBirth: string;
  nationality?: string;
  address: string;
  selfieUrl?: string;
  diditVerificationId?: string;
  createdAt: string;
}

export interface KycDocument {
  id: string;
  documentType: "PASSPORT" | "PASSPORT_FRONT" | "NATIONAL_ID" | "NATIONAL_ID_FRONT" | "NATIONAL_ID_BACK" | "DRIVER_LICENSE" | "DRIVER_LICENSE_FRONT" | "DRIVER_LICENSE_BACK" | "SELFIE";
  fileUrl: string;
  status: KycStatus;
  createdAt: string;
}

export interface KycEvent {
  id: string;
  userId: string;
  eventType: string;
  status: string;
  provider: string;
  rawPayload: Record<string, any> | null;
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

export interface KycStatusResult {
  profile: KycProfile | null;
  userTier: number;
  userStatus: string;
  nextTier: number | null;
  limits: {
    dailySend: number;
    monthlySend: number;
  };
  lastEvent: KycEvent | null;
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
