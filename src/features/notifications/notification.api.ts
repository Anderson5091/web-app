import { api } from "../../api/client";
import type { AppNotification, UnreadCount } from "./notification.types";

export const notificationApi = {
  getNotifications: () => api.get<AppNotification[]>("/notifications"),

  getUnreadNotifications: () => api.get<AppNotification[]>("/notifications/unread"),

  getUnreadCount: () => api.get<UnreadCount>("/notifications/unread-count"),

  markAsRead: (notificationId: string) =>
    api.post("/notifications/mark-read", { notificationId }),

  markAllAsRead: () => api.post("/notifications/mark-all-read"),
};
