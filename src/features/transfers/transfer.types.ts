export interface Quote {
  amount: number;
  fee: number;
  fxRate: number;
  destinationAmount: number;
}

export interface CreateTransferPayload {
  beneficiaryId: string;
  amount: number;
  payoutMethod: "BANK" | "MOBILE_MONEY" | "CASH_PICKUP";
}

export type TransferStatus =
  | "DRAFT"
  | "QUOTE_GENERATED"
  | "FUNDS_RESERVED"
  | "COMPLIANCE_CHECK"
  | "PENDING_PAYOUT"
  | "SENT_TO_PARTNER"
  | "DELIVERED"
  | "COMPLETED"
  | "FAILED";

export interface Transfer {
  id: string;
  beneficiaryId: string;
  amount: number;
  payoutMethod: string;
  status: TransferStatus;
  referenceId: string;
  fee?: number;
  fxRate?: number;
  destinationAmount?: number;
  payoutOrderId?: string;
  payoutStatus?: string;
  createdAt: string;
}
