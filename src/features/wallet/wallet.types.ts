export interface CryptoWallet {
  network: string;
  chain: string;
  address: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  status: string;
  availableBalance: string;
  pendingBalance: string;
  cryptoWallets?: CryptoWallet[];
  addresses?: { id: string; network: string; address: string }[];
}

export interface DepositAddress {
  network: string;
  address: string;
}

export interface DepositRequest {
  depositId: string;
  network: string;
  address: string;
}

export interface DepositStatus {
  depositId: string;
  network: string;
  amount: string | null;
  fee: string | null;
  netAmount: string | null;
  txHash: string | null;
  confirmations: number;
  status: string;
  address: string | null;
  addressStatus: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: string;
  network: string;
  txHash?: string;
  status: "PENDING" | "DETECTED" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export interface WithdrawalResponse {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  network: string;
  status: string;
  txHash?: string;
  explorerLink?: string;
}
