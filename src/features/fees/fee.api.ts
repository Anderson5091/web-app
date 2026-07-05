import { api } from "../../api/client";

export interface FeeEstimate {
  systemFee: number;
  processingFee: number;
  totalFee: number;
}

export interface FeeConfigInfo {
  transactionType: string;
  label: string | null;
  systemFeeEnabled: boolean;
  systemFeeMode: string;
  systemFixedFee: number;
  systemPercentFee: number;
  processingFeeEnabled: boolean;
  processingFeeMode: string;
  processingFixedFee: number;
  processingPercentFee: number;
}

export const feeApi = {
  async getEstimate(transactionType: string, amount: number): Promise<FeeEstimate> {
    const { data } = await api.get("/fees/estimate", {
      params: { transactionType, amount },
    });
    return data;
  },

  async getConfig(transactionType: string): Promise<FeeConfigInfo> {
    const { data } = await api.get(`/fees/config/${transactionType}`);
    return data;
  },
};
