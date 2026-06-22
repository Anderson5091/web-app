import { create } from "zustand";
import type { Wallet, DepositAddress, Transaction } from "./wallet.types";
import { WalletService } from "./wallet.service";

interface WalletState {
  wallet: Wallet | null;
  addresses: DepositAddress[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  fetchWallet: () => Promise<void>;
  fetchAddresses: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  addresses: [],
  transactions: [],
  isLoading: false,
  error: null,

  fetchWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await WalletService.getWallet();
      set({ wallet, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch wallet", isLoading: false });
    }
  },

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const addresses = await WalletService.getAddresses();
      set({ addresses, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch addresses", isLoading: false });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await WalletService.getTransactions();
      set({ transactions, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch transactions", isLoading: false });
    }
  },
  
  clearWallet: () => {
    set({ wallet: null, addresses: [], transactions: [], isLoading: false, error: null });
  }
}));
