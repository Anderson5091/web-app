import { notificationApi } from "./notification.api";
import type { AppNotification } from "./notification.types";
import { CURRENCY_TOKEN } from "../../config/constants";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const USE_MOCK = false;

const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    userId: "usr_1",
    type: "TRANSFER_UPDATE",
    channel: "IN_APP",
    title: "Transfer Completed",
    message: `Your transfer of 500.00 ${CURRENCY_TOKEN} has been completed successfully.`,
    status: "SENT",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "n2",
    userId: "usr_1",
    type: "KYC_UPDATE",
    channel: "IN_APP",
    title: "KYC Approved",
    message: "Your KYC application has been approved. You can now send up to $10,000 per day.",
    status: "SENT",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "n3",
    userId: "usr_1",
    type: "WALLET_ALERT",
    channel: "IN_APP",
    title: "Deposit Received",
    message: `1,000.00 ${CURRENCY_TOKEN} has been deposited to your wallet.`,
    status: "READ",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "n4",
    userId: "usr_1",
    type: "COMPLIANCE_ALERT",
    channel: "IN_APP",
    title: "Compliance Alert",
    message: "Your account has been flagged for compliance review.",
    status: "SENT",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "n5",
    userId: "usr_1",
    type: "TRANSFER_UPDATE",
    channel: "IN_APP",
    title: "Transfer Failed",
    message: `Your transfer of 200.00 ${CURRENCY_TOKEN} has failed. Please try again.`,
    status: "SENT",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const NotificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    if (USE_MOCK) {
      await delay(600);
      return mockNotifications;
    }
    const res = await notificationApi.getNotifications();
    return res.data;
  },

  getUnreadNotifications: async (): Promise<AppNotification[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockNotifications.filter((n) => n.status === "SENT" || n.status === "PENDING");
    }
    const res = await notificationApi.getUnreadNotifications();
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    if (USE_MOCK) {
      await delay(200);
      return mockNotifications.filter((n) => n.status === "SENT" || n.status === "PENDING").length;
    }
    const res = await notificationApi.getUnreadCount();
    return res.data.count;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      return;
    }
    await notificationApi.markAsRead(notificationId);
  },

  markAllAsRead: async (): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      return;
    }
    await notificationApi.markAllAsRead();
  },
};
