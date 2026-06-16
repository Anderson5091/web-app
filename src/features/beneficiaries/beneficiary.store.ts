import { create } from "zustand";
import type { Beneficiary, CreateBeneficiaryPayload } from "./beneficiary.types";
import { beneficiaryApi } from "./beneficiary.api";

interface BeneficiaryState {
  beneficiaries: Beneficiary[];
  isLoading: boolean;
  error: string | null;
  fetchBeneficiaries: () => Promise<void>;
  addBeneficiary: (data: CreateBeneficiaryPayload) => Promise<void>;
  deleteBeneficiary: (id: string) => Promise<void>;
}

export const useBeneficiaryStore = create<BeneficiaryState>((set, get) => ({
  beneficiaries: [],
  isLoading: false,
  error: null,

  fetchBeneficiaries: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await beneficiaryApi.getAll();
      set({ beneficiaries: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load beneficiaries", isLoading: false });
    }
  },

  addBeneficiary: async (data: CreateBeneficiaryPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await beneficiaryApi.create(data);
      set({ 
        beneficiaries: [...get().beneficiaries, res.data],
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to add beneficiary", isLoading: false });
      throw err; // Re-throw to handle form state
    }
  },

  deleteBeneficiary: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await beneficiaryApi.delete(id);
      set({ 
        beneficiaries: get().beneficiaries.filter(b => b.id !== id),
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to delete beneficiary", isLoading: false });
    }
  }
}));
