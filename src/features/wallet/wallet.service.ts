import { walletApi } from "./wallet.api";
import type { Wallet, DepositAddress, Transaction, DepositRequest, WithdrawalResponse } from "./wallet.types";

const USE_MOCK = false;

const mockWallet: Wallet = {
  id: "mock_wallet",
  userId: "user-001",
  currency: "USDT",
  status: "ACTIVE",
  availableBalance: "1450.00",
  pendingBalance: "50.00",
};

const mockAddresses: DepositAddress[] = [
  { network: "BASE", address: "0xBaseAddress1234567890abcdef1234567890abcdef" },
  { network: "ETHEREUM", address: "0x1234567890abcdef1234567890abcdef12345678" },
  { network: "POLYGON", address: "0x1234567890abcdef1234567890abcdef12345678" },
  { network: "SOLANA", address: "SolanaAddressHere1234567890abcdefghijkl" },
];

const mockTransactions: Transaction[] = [
  {
    id: "tx_1",
    type: "DEPOSIT",
    amount: "500.00",
    network: "BASE",
    txHash: "0xabc...def",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "tx_2",
    type: "WITHDRAWAL",
    amount: "150.00",
    network: "ETHEREUM",
    txHash: "0x123...456",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "tx_3",
    type: "TRANSFER",
    amount: "50.00",
    network: "INTERNAL",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const WalletService = {
  getWallet: async (): Promise<Wallet> => {
    if (USE_MOCK) {
      await delay(800);
      return mockWallet;
    }
    const res = await walletApi.getWallet();
    return res.data;
  },

  getAddresses: async (): Promise<DepositAddress[]> => {
    if (USE_MOCK) {
      await delay(800);
      return mockAddresses;
    }
    const res = await walletApi.getAddresses();
    return res.data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    if (USE_MOCK) {
      await delay(800);
      return mockTransactions;
    }
    const res = await walletApi.getTransactions();
    return res.data;
  },

  withdraw: async (data: {
    network: string;
    address: string;
    amount: string;
  }): Promise<WithdrawalResponse> => {
    if (USE_MOCK) {
      await delay(1500);
      if (parseFloat(data.amount) > parseFloat(mockWallet.availableBalance)) {
        throw new Error("Insufficient funds");
      }
      return {
        id: `wd_mock_${Date.now()}`,
        amount: parseFloat(data.amount),
        fee: data.network === "ETHEREUM" ? 10 : 1,
        netAmount:
          parseFloat(data.amount) - (data.network === "ETHEREUM" ? 10 : 1),
        network: data.network,
        status: "PENDING",
      };
    }
    const res = await walletApi.withdraw(data);
    return res.data;
  },

  createDeposit: async (data: {
    chain: string;
    token?: string;
  }): Promise<DepositRequest> => {
    if (USE_MOCK) {
      await delay(1000);
      return {
        depositId: `dep_mock_${Date.now()}`,
        network: data.chain,
        address: `0x${Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")}`,
      };
    }
    const res = await walletApi.createDeposit(data);
    return res.data;
  },

  internalTransfer: async (data: {
    recipientEmail: string;
    amount: string;
  }): Promise<void> => {
    if (USE_MOCK) {
      await delay(1500);
      if (parseFloat(data.amount) > parseFloat(mockWallet.availableBalance)) {
        throw new Error("Insufficient funds");
      }
      return;
    }
    await walletApi.internalTransfer(data);
  },
};
