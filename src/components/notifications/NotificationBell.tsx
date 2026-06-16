import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotificationStore } from "../../features/notifications/notification.store";

export default function NotificationBell() {
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <Link
      to="/notifications"
      className="relative flex items-center text-text-secondary hover:text-primary transition-colors font-medium text-sm p-2"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
