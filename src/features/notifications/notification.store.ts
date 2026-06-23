import { create } from "zustand";
import type { AppNotification, NotificationPreferences } from "./notification.types";
import { DEFAULT_PREFERENCES } from "./notification.types";
import { NotificationService } from "./notification.service";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  preferences: NotificationPreferences;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setPreference: <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => void;
}

const loadPreferences = (): NotificationPreferences => {
  try {
    const saved = localStorage.getItem("notification_preferences");
    return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  preferences: loadPreferences(),

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

  setPreference: (key, value) => {
    set((state) => {
      const preferences = { ...state.preferences, [key]: value };
      localStorage.setItem("notification_preferences", JSON.stringify(preferences));
      return { preferences };
    });
  },
}));
