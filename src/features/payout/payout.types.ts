export type PayoutStatus =
  | "PENDING"
  | "QUEUED"
  | "PROCESSING"
  | "SENT_TO_PARTNER"
  | "CONFIRMED"
  | "DELIVERED"
  | "FAILED";

export interface PayoutOrder {
  id: string;
  transferId: string;
  partner: string;
  payoutMethod: string;
  status: PayoutStatus;
  externalReference: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutEvent {
  id: string;
  payoutOrderId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface PayoutPartner {
  name: string;
  displayName: string;
  method: "BANK" | "MOBILE_MONEY" | "CASH_PICKUP";
}

export interface PartnerLog {
  id: string;
  partner: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  statusCode: number;
  createdAt: string;
}

export interface PartnerInfo {
  id: string;
  name: string;
  type: "BANK" | "MOBILE_MONEY" | "CASH_PICKUP";
  country: string | null;
  status: string;
  priority: number;
  baseUrl: string | null;
  createdAt: string;
}

export interface PartnerSlaMetric {
  id: string;
  partnerId: string;
  successRate: number | null;
  avgResponseTimeMs: number | null;
  failureCount: number;
}
