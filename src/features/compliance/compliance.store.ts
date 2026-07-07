import { create } from "zustand";
import type { KycStatusResult } from "./compliance.types";
import { complianceApi } from "./compliance.api";

interface ComplianceState {
  kycStatus: KycStatusResult | null;
  isLoading: boolean;
  isSubmitting: boolean;
  submitResult: { status: string; tier: number; details: any } | null;
  error: string | null;

  fetchStatus: () => Promise<void>;
  submitTier1: (payload: { fullName: string; dateOfBirth: string; nationality: string; country: string; address: string }) => Promise<{ status: string; tier: number; details: any } | null>;
  submitTier2: (payload: { idImage: string; selfieImage: string; documentType: string }) => Promise<{ status: string; tier: number; details: any } | null>;
  submitTier3: (payload: { poaImage: string; sourceOfFunds?: string }) => Promise<{ status: string; tier: number; details: any } | null>;
  clearResult: () => void;
  clearError: () => void;
}

export const useComplianceStore = create<ComplianceState>((set) => ({
  kycStatus: null,
  isLoading: false,
  isSubmitting: false,
  submitResult: null,
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await complianceApi.getStatus();
      set({ kycStatus: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch KYC status", isLoading: false });
    }
  },

  submitTier1: async (payload) => {
    set({ isSubmitting: true, error: null, submitResult: null });
    try {
      const result = await complianceApi.submitTier1(payload);
      set({ isSubmitting: false, submitResult: result });
      return result;
    } catch (err: any) {
      set({ error: err.message || "Tier 1 submission failed", isSubmitting: false });
      return null;
    }
  },

  submitTier2: async (payload) => {
    set({ isSubmitting: true, error: null, submitResult: null });
    try {
      const result = await complianceApi.submitTier2(payload);
      set({ isSubmitting: false, submitResult: result });
      return result;
    } catch (err: any) {
      set({ error: err.message || "Tier 2 submission failed", isSubmitting: false });
      return null;
    }
  },

  submitTier3: async (payload) => {
    set({ isSubmitting: true, error: null, submitResult: null });
    try {
      const result = await complianceApi.submitTier3(payload);
      set({ isSubmitting: false, submitResult: result });
      return result;
    } catch (err: any) {
      set({ error: err.message || "Tier 3 submission failed", isSubmitting: false });
      return null;
    }
  },

  clearResult: () => set({ submitResult: null }),
  clearError: () => set({ error: null }),
}));
