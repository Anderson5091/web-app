import { api } from "../../api/client";
import type { KycStatusResult } from "./compliance.types";

export const complianceApi = {
  getStatus: async (): Promise<KycStatusResult> => {
    const { data } = await api.get("/kyc/status");
    return data;
  },

  submitTier1: async (payload: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    country: string;
    address: string;
  }): Promise<{ status: string; tier: number; details: any }> => {
    const { data } = await api.post("/kyc/tier-1", payload);
    return data;
  },

  submitTier2: async (payload: {
    idImage: string;
    idImageBack?: string;
    selfieImage: string;
    documentType: string;
  }): Promise<{ status: string; tier: number; details: any }> => {
    const { data } = await api.post("/kyc/tier-2", payload);
    return data;
  },

  submitTier3: async (payload: {
    poaImage: string;
    sourceOfFunds?: string;
  }): Promise<{ status: string; tier: number; details: any }> => {
    const { data } = await api.post("/kyc/tier-3", payload);
    return data;
  },
};
