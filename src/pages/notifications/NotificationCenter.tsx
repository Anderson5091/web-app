import { useEffect } from "react";
import { useNotificationStore } from "../../features/notifications/notification.store";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowLeft, CheckCheck, Send, Shield, Wallet, AlertTriangle, Ban, Clock } from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  TRANSFER_UPDATE: Send,
  PAYOUT_UPDATE: Send,
  KYC_UPDATE: Shield,
  COMPLIANCE_ALERT: AlertTriangle,
  TREASURY_ALERT: Wallet,
  WALLET_ALERT: Wallet,
  SECURITY_ALERT: Ban,
};

const typeColors: Record<string, string> = {
  TRANSFER_UPDATE: "bg-indigo-50 text-indigo-600",
  PAYOUT_UPDATE: "bg-emerald-50 text-emerald-600",
  KYC_UPDATE: "bg-violet-50 text-violet-600",
  COMPLIANCE_ALERT: "bg-amber-50 text-amber-600",
  TREASURY_ALERT: "bg-blue-50 text-blue-600",
  WALLET_ALERT: "bg-purple-50 text-purple-600",
  SECURITY_ALERT: "bg-rose-50 text-rose-600",
};

export default function NotificationCenter() {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">Q</div>
            <span className="font-extrabold text-slate-800 tracking-tight text-lg">Notifications</span>
          </div>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
        >
          <CheckCheck size={16} />
          <span>Mark All Read</span>
        </button>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <Bell size={28} />
            </div>
            <h3 className="text-slate-800 font-bold text-base">No notifications</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-[280px]">
              When something happens, you will see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type || ""] || Bell;
              const colorClass = typeColors[notification.type || ""] || "bg-slate-50 text-slate-600";
              const isUnread = notification.status === "SENT" || notification.status === "PENDING";

              return (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (isUnread) markAsRead(notification.id);
                  }}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    isUnread
                      ? "bg-white border-slate-100 hover:border-indigo-100 hover:shadow-sm"
                      : "bg-white/50 border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-semibold ${isUnread ? "text-slate-900" : "text-slate-600"}`}>
                        {notification.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                      <Clock size={10} />
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
