import { create } from "zustand";
import type { Quote, Transfer, CreateTransferPayload } from "./transfer.types";
import { quoteApi } from "./quote.api";
import { transferApi } from "./transfer.api";

interface TransferState {
  currentQuote: Quote | null;
  activeTransfer: Transfer | null;
  isLoadingQuote: boolean;
  isSubmittingTransfer: boolean;
  error: string | null;
  
  getQuote: (amount: number, currency: string, country: string, method: string) => Promise<Quote>;
  submitTransfer: (data: CreateTransferPayload) => Promise<Transfer>;
  clearState: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  currentQuote: null,
  activeTransfer: null,
  isLoadingQuote: false,
  isSubmittingTransfer: false,
  error: null,

  getQuote: async (amount, currency, country, method) => {
    set({ isLoadingQuote: true, error: null, currentQuote: null });
    try {
      const res = await quoteApi.getQuote({ amount, currency, country, method });
      set({ currentQuote: res.data, isLoadingQuote: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch quote", isLoadingQuote: false });
      throw err;
    }
  },

  submitTransfer: async (data) => {
    set({ isSubmittingTransfer: true, error: null });
    try {
      const res = await transferApi.create(data);
      set({ activeTransfer: res.data, isSubmittingTransfer: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.message || "Failed to process transfer", isSubmittingTransfer: false });
      throw err;
    }
  },

  clearState: () => {
    set({ currentQuote: null, activeTransfer: null, error: null });
  }
}));
