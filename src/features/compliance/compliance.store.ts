import { create } from "zustand";
import type { ComplianceOverview, KycDocument } from "./compliance.types";
import { complianceApi } from "./compliance.api";

interface ComplianceState {
  overview: ComplianceOverview | null;
  documents: KycDocument[];
  isLoading: boolean;
  isUploading: boolean;
  isUpgrading: boolean;
  uploadMessage: string | null;
  upgradeMessage: string | null;
  error: string | null;

  fetchOverview: () => Promise<void>;
  uploadDocument: (documentType: string) => Promise<void>;
  requestTierUpgrade: () => Promise<void>;
  clearMessages: () => void;
}

export const useComplianceStore = create<ComplianceState>((set) => ({
  overview: null,
  documents: [],
  isLoading: false,
  isUploading: false,
  isUpgrading: false,
  uploadMessage: null,
  upgradeMessage: null,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await complianceApi.getOverview();
      const data = res.data as any;
      const overview: ComplianceOverview = {
        kycProfile: data.profile || data.kycProfile,
        documents: data.documents || [],
        amlCheck: data.amlCheck || null,
        sanctionsHits: data.sanctionsHits || [],
        riskScore: data.riskScore
          ? { ...data.riskScore, factors: Array.isArray(data.riskScore.factors) ? data.riskScore.factors : [] }
          : data.riskScore,
        recentCases: data.recentCases || [],
        limits: data.limits || { dailySendLimit: 1000, monthlySendLimit: 10000, remainingDaily: 1000, remainingMonthly: 10000 },
      };
      set({
        overview,
        documents: overview.documents,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch compliance data",
        isLoading: false,
      });
    }
  },

  uploadDocument: async (documentType) => {
    set({ isUploading: true, error: null, uploadMessage: null });
    try {
      const res = await complianceApi.uploadDocument(documentType);
      set((state) => ({
        documents: [...state.documents, res.data],
        isUploading: false,
        uploadMessage: `${documentType.replace("_", " ")} uploaded successfully. Pending review.`,
      }));
    } catch (err: any) {
      set({
        error: err.message || "Upload failed",
        isUploading: false,
      });
    }
  },

  requestTierUpgrade: async () => {
    set({ isUpgrading: true, error: null, upgradeMessage: null });
    try {
      const res = await complianceApi.requestTierUpgrade();
      set({
        isUpgrading: false,
        upgradeMessage: res.data.message,
      });
    } catch (err: any) {
      set({
        error: err.message || "Upgrade request failed",
        isUpgrading: false,
      });
    }
  },

  clearMessages: () => {
    set({ uploadMessage: null, upgradeMessage: null, error: null });
  },
}));
