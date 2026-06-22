import { create } from "zustand";
import type { PayoutOrder } from "./payout.types";
import { payoutApi } from "./payout.api";

interface PayoutState {
  currentPayout: PayoutOrder | null;
  payoutHistory: PayoutOrder[];
  isLoading: boolean;
  isExecuting: boolean;
  error: string | null;

  executePayout: (transferId: string) => Promise<PayoutOrder>;
  getPayoutStatus: (id: string) => Promise<PayoutOrder | null>;
  retryPayout: (id: string) => Promise<void>;
  listenForUpdates: (id: string) => () => void;
  clearPayout: () => void;
}

export const usePayoutStore = create<PayoutState>((set, get) => ({
  currentPayout: null,
  payoutHistory: [],
  isLoading: false,
  isExecuting: false,
  error: null,

  executePayout: async (transferId) => {
    set({ isExecuting: true, error: null });
    try {
      const res = await payoutApi.execute(transferId);
      const order = res.data;
      set({
        currentPayout: order,
        payoutHistory: [...get().payoutHistory, order],
        isExecuting: false,
      });
      return order;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to execute payout",
        isExecuting: false,
      });
      throw err;
    }
  },

  getPayoutStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await payoutApi.getStatus(id);
      if (res.data) {
        set({ currentPayout: res.data, isLoading: false });
        return res.data;
      }
      set({ isLoading: false });
      return null;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch payout status",
        isLoading: false,
      });
      return null;
    }
  },

  retryPayout: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await payoutApi.retry(id);
      if (res.data) {
        set({ currentPayout: res.data, isLoading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to retry payout",
        isLoading: false,
      });
    }
  },

  listenForUpdates: (id) => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as PayoutOrder;
      if (detail.id === id) {
        set({ currentPayout: detail });
      }
    };
    window.addEventListener("payout-update", handler);
    return () => window.removeEventListener("payout-update", handler);
  },

  clearPayout: () => {
    set({ currentPayout: null, error: null });
  },
}));
