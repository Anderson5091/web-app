import { api } from "../../api/client";
import type { ComplianceOverview, KycDocument } from "./compliance.types";

export const USE_COMPLIANCE_MOCK = false;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function generateMockCompliance(): ComplianceOverview {
  return {
    kycProfile: {
      id: "kyc_1",
      userId: "usr_1",
      tier: 1,
      status: "APPROVED",
      fullName: "John Doe",
      country: "United States",
      dateOfBirth: "1990-01-15",
      address: "123 Main Street, New York, NY 10001",
      createdAt: new Date(Date.now() - 604800000).toISOString(),
    },
    documents: [
      {
        id: "doc_1",
        documentType: "PASSPORT",
        fileUrl: "/uploads/passport.jpg",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 518400000).toISOString(),
      },
      {
        id: "doc_2",
        documentType: "NATIONAL_ID",
        fileUrl: "/uploads/id_front.jpg",
        status: "PENDING",
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
    amlCheck: {
      id: "aml_1",
      riskLevel: "LOW",
      flags: [],
      createdAt: new Date().toISOString(),
    },
    sanctionsHits: [],
    riskScore: {
      score: 15,
      level: "LOW",
      factors: ["KYC Tier 1", "Account age < 6 months"],
      updatedAt: new Date().toISOString(),
    },
    recentCases: [
      {
        id: "case_1",
        status: "RESOLVED",
        reason: "Routine KYC verification - cleared",
        assignedTo: "System",
        createdAt: new Date(Date.now() - 604800000).toISOString(),
      },
    ],
    limits: {
      dailySendLimit: 1000,
      monthlySendLimit: 10000,
      remainingDaily: 750,
      remainingMonthly: 8200,
    },
  };
}

const cachedData = generateMockCompliance();

export const complianceApi = {
  getOverview: async (): Promise<{ data: ComplianceOverview }> => {
    if (USE_COMPLIANCE_MOCK) {
      await delay(500);
      return { data: cachedData };
    }
    return api.get("/kyc/status");
  },

  uploadDocument: async (documentType: string, fileUrl?: string): Promise<{ data: KycDocument }> => {
    if (USE_COMPLIANCE_MOCK) {
      await delay(2000);
      const doc: KycDocument = {
        id: `doc_${Date.now()}`,
        documentType: documentType as any,
        fileUrl: fileUrl || "/uploads/new_document.jpg",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      return { data: doc };
    }
    return api.post("/kyc/upload", { documentType, fileUrl });
  },

  requestTierUpgrade: async (): Promise<{ data: { success: boolean; message: string } }> => {
    if (USE_COMPLIANCE_MOCK) {
      await delay(1500);
      return {
        data: {
          success: true,
          message: "Tier upgrade requested. Additional documents may be required.",
        },
      };
    }
    return api.post("/kyc/upgrade-tier");
  },
};
