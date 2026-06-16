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
