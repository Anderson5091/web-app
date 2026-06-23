export interface AppNotification {
  id: string;
  userId: string | null;
  type: string | null;
  channel: string | null;
  title: string | null;
  message: string | null;
  status: string | null;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

export type NotificationType =
  | "TRANSFER_UPDATE"
  | "PAYOUT_UPDATE"
  | "KYC_UPDATE"
  | "COMPLIANCE_ALERT"
  | "TREASURY_ALERT"
  | "WALLET_ALERT"
  | "SECURITY_ALERT";

export interface NotificationPreferences {
  transferUpdates: boolean;
  deposits: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  transferUpdates: true,
  deposits: true,
};

export const NOTIFICATION_TYPE_MAP: Record<keyof NotificationPreferences, NotificationType[]> = {
  transferUpdates: ["TRANSFER_UPDATE", "PAYOUT_UPDATE"],
  deposits: ["WALLET_ALERT"],
};
