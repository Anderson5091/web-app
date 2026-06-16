export interface Beneficiary {
  id: string;
  fullName: string;
  country: string;
  payoutMethod: "BANK" | "MOBILE_MONEY" | "CASH_PICKUP";
  bankName?: string;
  accountNumber?: string;
  mobileWalletNumber?: string;
  mobileProvider?: string;
  cashPickupLocation?: string;
  createdAt?: string;
}

export interface CreateBeneficiaryPayload {
  fullName: string;
  country: string;
  payoutMethod: "BANK" | "MOBILE_MONEY" | "CASH_PICKUP";
  bankName?: string;
  accountNumber?: string;
  mobileWalletNumber?: string;
  mobileProvider?: string;
  cashPickupLocation?: string;
}
