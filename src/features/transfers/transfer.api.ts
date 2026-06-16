import { api } from "../../api/client";
import type { Transfer, CreateTransferPayload } from "./transfer.types";

export const USE_TRANSFER_MOCK = false;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const transferApi = {
  create: async (data: CreateTransferPayload) => {
    if (USE_TRANSFER_MOCK) {
      await delay(1500);

      const transfer: Transfer = {
        ...data,
        id: `tx_${Date.now()}`,
        status: "PENDING_PAYOUT",
        referenceId: `QS-${Date.now()}`,
        payoutOrderId: `po_${Date.now()}`,
        payoutStatus: "PENDING",
        createdAt: new Date().toISOString(),
      };

      return { data: transfer };
    }
    return api.post<Transfer>("/transfers", data);
  },

  getTransfer: async (id: string) => {
    if (USE_TRANSFER_MOCK) {
      await delay(800);
      return { data: null };
    }
    return api.get<Transfer>(`/transfers/${id}`);
  },
};
