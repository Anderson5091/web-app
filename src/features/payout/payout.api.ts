import { api } from "../../api/client";
import type { PayoutOrder, PayoutStatus, PartnerInfo, PartnerSlaMetric } from "./payout.types";

export const USE_PAYOUT_MOCK = false;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const simulatePayoutFlow = async (orderId: string): Promise<void> => {
  const statusFlow: PayoutStatus[] = [
    "QUEUED",
    "PROCESSING",
    "SENT_TO_PARTNER",
    "CONFIRMED",
    "DELIVERED",
  ];

  for (const status of statusFlow) {
    await delay(2000);
    const stored = sessionStorage.getItem(`payout_${orderId}`);
    if (!stored) break;
    const order = JSON.parse(stored);
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === "SENT_TO_PARTNER") {
      order.externalReference = `EXT-${Date.now()}`;
    }
    sessionStorage.setItem(`payout_${orderId}`, JSON.stringify(order));
    window.dispatchEvent(new CustomEvent("payout-update", { detail: order }));
  }
};

export const payoutApi = {
  execute: async (transferId: string) => {
    if (USE_PAYOUT_MOCK) {
      await delay(1000);

      const order: PayoutOrder = {
        id: `po_${Date.now()}`,
        transferId,
        partner: transferId.includes("BANK") ? "BANK_PARTNER_A" : "MOBILE_MONEY_PARTNER_B",
        payoutMethod: "BANK",
        status: "PENDING",
        externalReference: null,
        attemptCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sessionStorage.setItem(`payout_${order.id}`, JSON.stringify(order));
      simulatePayoutFlow(order.id);

      return { data: order };
    }
    return api.post<PayoutOrder>("/payout/execute", { transferId });
  },

  getStatus: async (id: string) => {
    if (USE_PAYOUT_MOCK) {
      await delay(500);
      const stored = sessionStorage.getItem(`payout_${id}`);
      if (stored) {
        return { data: JSON.parse(stored) as PayoutOrder };
      }
      return { data: null };
    }
    return api.get<PayoutOrder>(`/payout/${id}`);
  },

  retry: async (id: string) => {
    if (USE_PAYOUT_MOCK) {
      await delay(800);
      const stored = sessionStorage.getItem(`payout_${id}`);
      if (stored) {
        const order = JSON.parse(stored) as PayoutOrder;
        order.attemptCount += 1;
        order.status = "QUEUED";
        order.updatedAt = new Date().toISOString();
        sessionStorage.setItem(`payout_${id}`, JSON.stringify(order));
        simulatePayoutFlow(order.id);
        return { data: order };
      }
      return { data: null };
    }
    return api.post<PayoutOrder>(`/payout/${id}/retry`);
  },

  getPartners: async () => {
    if (USE_PAYOUT_MOCK) {
      await delay(500);
      const mockPartners: PartnerInfo[] = [
        { id: "p1", name: "SwiftPay Bank", type: "BANK", country: "US", status: "ACTIVE", priority: 1, baseUrl: "https://api.swiftpay.com", createdAt: new Date().toISOString() },
        { id: "p2", name: "MobileWave", type: "MOBILE_MONEY", country: "GH", status: "ACTIVE", priority: 2, baseUrl: "https://api.mobilewave.com", createdAt: new Date().toISOString() },
        { id: "p3", name: "CashNet Express", type: "CASH_PICKUP", country: "NG", status: "ACTIVE", priority: 3, baseUrl: "https://api.cashnet.com", createdAt: new Date().toISOString() },
        { id: "p4", name: "GlobalPay", type: "BANK", country: "UK", status: "ACTIVE", priority: 2, baseUrl: "https://api.globalpay.com", createdAt: new Date().toISOString() },
        { id: "p5", name: "DigiCash", type: "MOBILE_MONEY", country: "KE", status: "INACTIVE", priority: 3, baseUrl: "https://api.digicash.com", createdAt: new Date().toISOString() },
      ];
      return { data: mockPartners };
    }
    return api.get<PartnerInfo[]>("/partners");
  },

  getPartnerMetrics: async (partnerId: string) => {
    if (USE_PAYOUT_MOCK) {
      await delay(300);
      const metrics: PartnerSlaMetric = {
        id: `m_${partnerId}`,
        partnerId,
        successRate: Math.random() > 0.2 ? 95 + Math.floor(Math.random() * 5) : 75 + Math.floor(Math.random() * 15),
        avgResponseTimeMs: Math.floor(Math.random() * 2000) + 500,
        failureCount: Math.floor(Math.random() * 10),
      };
      return { data: metrics };
    }
    return api.get<PartnerSlaMetric>(`/partners/${partnerId}/metrics`);
  },

  simulateRoute: async (data: { payoutMethod: string; amount: number }) => {
    if (USE_PAYOUT_MOCK) {
      await delay(800);
      const partnerNames: Record<string, { name: string; id: string }> = {
        BANK: { name: "SwiftPay Bank", id: "p1" },
        MOBILE_MONEY: { name: "MobileWave", id: "p2" },
        CASH_PICKUP: { name: "CashNet Express", id: "p3" },
      };
      const p = partnerNames[data.payoutMethod] || { name: "Default Partner", id: "p0" };
      return {
        data: {
          routing: { partner: { id: p.id, name: p.name, type: data.payoutMethod }, adapterType: data.payoutMethod },
          response: { status: "SUCCESS", externalReference: `EXT-${Date.now()}`, message: "Payout routed successfully" },
        },
      };
    }
    return api.post("/partners/route", data);
  },
};
