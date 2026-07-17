import { walletApi } from "./wallet.api";
import type { Wallet, DepositAddress, Transaction, DepositRequest, WithdrawalResponse, DepositStatus, WithdrawalDetail } from "./wallet.types";
import { CURRENCY_TOKEN } from "../../config/constants";

const USE_MOCK = false;

const mockWallet: Wallet = {
  id: "mock_wallet",
  userId: "user-001",
  currency: CURRENCY_TOKEN,
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
    amount: 500,
    network: "BASE",
    txHash: "0xabc...def",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "tx_2",
    type: "WITHDRAWAL",
    amount: 150,
    network: "ETHEREUM",
    txHash: "0x123...456",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "tx_3",
    type: "TRANSFER",
    amount: 50,
    network: "INTERNAL",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    transferType: "internal",
    recipientEmail: "jane@example.com",
  },
  {
    id: "tx_4",
    type: "TRANSFER",
    amount: 200,
    network: "BANK",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    transferType: "global",
    recipientName: "Alice Smith",
    recipientPhone: "+1 (555) 123-4567",
  },
  {
    id: "tx_5",
    type: "TRANSFER",
    amount: 300,
    network: "BANK_ACCOUNT",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    transferType: "global",
    recipientName: "Bob Johnson",
    recipientBankAccount: "****4532",
  },
  {
    id: "tx_6",
    type: "TRANSFER",
    amount: 120,
    network: "CASH",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    transferType: "global",
    recipientName: "Carlos Garcia",
    recipientCashPickup: "Walmart - Main St",
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

  getDepositStatus: async (depositId: string): Promise<DepositStatus> => {
    if (USE_MOCK) {
      await delay(500);
      return {
        depositId,
        network: "BASE",
        amount: "100",
        fee: "1",
        netAmount: "99",
        txHash: null,
        confirmations: 0,
        status: "WALLET_CREATED",
        address: "0xMockAddress...",
        addressStatus: "CREATED",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
    }
    const res = await walletApi.getDepositStatus(depositId);
    return res.data;
  },

  getWithdrawal: async (id: string): Promise<WithdrawalDetail> => {
    if (USE_MOCK) {
      await delay(500);
      return {
        id,
        amount: 100,
        fee: 1,
        netAmount: 99,
        chain: "BASE",
        destinationAddress: "0xMockDestination...",
        txHash: null,
        explorerLink: null,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
    }
    const res = await walletApi.getWithdrawal(id);
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
