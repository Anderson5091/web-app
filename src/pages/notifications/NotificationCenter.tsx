import { useEffect } from "react";
import { useNotificationStore } from "../../features/notifications/notification.store";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowLeft, CheckCheck, Send, Shield, AlertTriangle, Wallet, Ban, Clock } from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  TRANSFER_UPDATE: Send,
  PAYOUT_UPDATE: Send,
  KYC_UPDATE: Shield,
  COMPLIANCE_ALERT: AlertTriangle,
  TREASURY_ALERT: Wallet,
  WALLET_ALERT: Wallet,
  SECURITY_ALERT: Ban,
};

const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
  TRANSFER_UPDATE: { bg: "bg-primary-dim", text: "text-primary", border: "border-primary-border" },
  PAYOUT_UPDATE: { bg: "bg-primary-dim", text: "text-primary", border: "border-primary-border" },
  KYC_UPDATE: { bg: "bg-warning-dim", text: "text-warning", border: "border-warning/25" },
  COMPLIANCE_ALERT: { bg: "bg-warning-dim", text: "text-warning", border: "border-warning/25" },
  TREASURY_ALERT: { bg: "bg-primary-dim", text: "text-primary", border: "border-primary-border" },
  WALLET_ALERT: { bg: "bg-primary-dim", text: "text-primary", border: "border-primary-border" },
  SECURITY_ALERT: { bg: "bg-danger-dim", text: "text-danger", border: "border-danger/25" },
};

export default function NotificationCenter() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors">
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
            <div>
              <h1 className="text-text-primary text-xl font-bold">Notifications</h1>
              <p className="text-text-secondary text-xs">Stay updated on your activity</p>
            </div>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-dim"
            >
              <CheckCheck size={14} />
              Mark All Read
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 border border-border">
              <Bell size={28} className="text-text-subtle" />
            </div>
            <h3 className="text-text-primary font-bold text-base">No notifications</h3>
            <p className="text-text-subtle text-sm mt-1 max-w-[280px]">
              When something happens, you will see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type || ""] || Bell;
              const style = typeStyles[notification.type || ""] || { bg: "bg-card-alt", text: "text-text-secondary", border: "border-border" };
              const isUnread = notification.status === "SENT" || notification.status === "PENDING";

              return (
                <button
                  key={notification.id}
                  onClick={() => { if (isUnread) markAsRead(notification.id); }}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    isUnread
                      ? "bg-card border-border hover:border-primary/30"
                      : "bg-card/50 border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${style.bg} ${style.border} border`}>
                    <Icon size={18} className={style.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-semibold ${isUnread ? "text-text-primary" : "text-text-secondary"}`}>
                        {notification.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className={`text-xs mt-1 line-clamp-2 ${isUnread ? "text-text-secondary" : "text-text-subtle"}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-text-subtle">
                      <Clock size={10} />
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
