import { api } from "../../api/client";
import type { Beneficiary, CreateBeneficiaryPayload } from "./beneficiary.types";

// NOTE: Set to true to mock backend for UI testing
export const USE_BENEFICIARY_MOCK = false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockBeneficiaries: Beneficiary[] = [
  {
    id: "ben_1",
    fullName: "Jean Paul",
    country: "Haiti",
    payoutMethod: "BANK",
    bankName: "Sogebank",
    accountNumber: "123456789",
    createdAt: new Date().toISOString()
  },
  {
    id: "ben_2",
    fullName: "Maria Garcia",
    country: "Mexico",
    payoutMethod: "CASH_PICKUP",
    cashPickupLocation: "Mexico City Central",
    createdAt: new Date().toISOString()
  }
];

export const beneficiaryApi = {
  getAll: async () => {
    if (USE_BENEFICIARY_MOCK) {
      await delay(800);
      return { data: mockBeneficiaries };
    }
    return api.get<Beneficiary[]>("/beneficiaries");
  },
  
  create: async (data: CreateBeneficiaryPayload) => {
    if (USE_BENEFICIARY_MOCK) {
      await delay(1000);
      const newBen: Beneficiary = {
        ...data,
        id: `ben_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      mockBeneficiaries = [...mockBeneficiaries, newBen];
      return { data: newBen };
    }
    return api.post<Beneficiary>("/beneficiaries", data);
  },
  
  delete: async (id: string) => {
    if (USE_BENEFICIARY_MOCK) {
      await delay(800);
      mockBeneficiaries = mockBeneficiaries.filter(b => b.id !== id);
      return { data: { success: true } };
    }
    return api.delete(`/beneficiaries/${id}`);
  }
};
