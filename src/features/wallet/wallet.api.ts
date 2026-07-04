import { api } from "../../api/client";
import type { Wallet, DepositAddress, Transaction, DepositRequest, WithdrawalResponse, DepositStatus, WithdrawalDetail } from "./wallet.types";

export const walletApi = {
  getWallet: () => api.get<Wallet>("/wallet"),

  getAddresses: () => api.get<DepositAddress[]>("/wallet/addresses"),

  getTransactions: () => api.get<Transaction[]>("/wallet/transactions"),

  getTransaction: (id: string) => api.get<Transaction>(`/wallet/transactions/${id}`),

  withdraw: (data: { network: string; address: string; amount: string }) =>
    api.post<WithdrawalResponse>("/withdrawals", {
      ...data,
      amount: parseFloat(data.amount),
    }),

  createDeposit: (data: { chain: string; token?: string }) =>
    api.post<DepositRequest>("/deposits/create", data),

  getDepositStatus: (depositId: string) =>
    api.get<DepositStatus>(`/deposits/${depositId}/status`),

  getWithdrawal: (id: string) =>
    api.get<WithdrawalDetail>(`/withdrawals/${id}`),

  internalTransfer: (data: { recipientEmail: string; amount: string }) =>
    api.post("/wallet/internal-transfer", {
      ...data,
      amount: parseFloat(data.amount),
    }),
};
