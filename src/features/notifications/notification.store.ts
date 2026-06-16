import { create } from "zustand";
import type { AppNotification } from "./notification.types";
import { NotificationService } from "./notification.service";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await NotificationService.getNotifications();
      set({ notifications, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch notifications", isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // silently fail for count
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, status: "READ" } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to mark as read" });
    }
  },

  markAllAsRead: async () => {
    try {
      await NotificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, status: "READ" })),
        unreadCount: 0,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to mark all as read" });
    }
  },
}));
