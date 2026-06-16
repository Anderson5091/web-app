import { api } from "../../api/client";
import type { Wallet, DepositAddress, Transaction, DepositRequest, WithdrawalResponse } from "./wallet.types";

export const walletApi = {
  getWallet: () => api.get<Wallet>("/wallet"),

  getAddresses: () => api.get<DepositAddress[]>("/wallet/addresses"),

  getTransactions: () => api.get<Transaction[]>("/wallet/transactions"),

  withdraw: (data: { network: string; address: string; amount: string }) =>
    api.post<WithdrawalResponse>("/withdrawals", {
      ...data,
      amount: parseFloat(data.amount),
    }),

  createDeposit: (data: { chain: string; token?: string }) =>
    api.post<DepositRequest>("/deposits/create", data),

  internalTransfer: (data: { recipientEmail: string; amount: string }) =>
    api.post("/wallet/internal-transfer", {
      ...data,
      amount: parseFloat(data.amount),
    }),
};
