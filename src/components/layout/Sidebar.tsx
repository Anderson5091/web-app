import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";
import { useNotificationStore } from "../../features/notifications/notification.store";
import {
  LayoutDashboard,
  Wallet,
  Send,
  Users,
  History,
  Shield,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useEffect } from "react";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { path: "/home", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/wallet", icon: Wallet, label: "Wallet" },
      { path: "/wallet/transfer", icon: Send, label: "Send Money", highlight: true },
    ],
  },
  {
    label: "Management",
    items: [
      { path: "/beneficiaries", icon: Users, label: "Recipients" },
      { path: "/wallet/transactions", icon: History, label: "History" },
      { path: "/compliance", icon: Shield, label: "Compliance" },
    ],
  },
  {
    label: "Support",
    items: [
      { path: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const isActive = (path: string) => {
    if (path === "/home" || path === "/wallet") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen shrink-0">
      {/* Logo + Notifications */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-md bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-[#00D6A3]/20 shrink-0">
          Q
        </div>
        <span className="font-extrabold text-text-primary tracking-tight text-lg">QuickSend</span>
        <Link
          to="/notifications"
          className="ml-auto relative flex items-center text-text-secondary hover:text-primary transition-colors py-1.5 pl-1.5"
          style={{ paddingRight: "3px" }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                if (item.highlight) {
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white font-semibold text-sm mb-2 hover:opacity-90 transition-opacity"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                      <ChevronRight size={16} className="ml-auto opacity-60" />
                    </button>
                  );
                }

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary-dim text-primary border border-primary-border"
                        : "text-text-secondary hover:text-text-primary hover:bg-card-alt"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section: user + sign out */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-dim border border-primary-border flex items-center justify-center">
            <span className="text-primary text-xs font-bold">
              {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-medium truncate">
              {user?.name || user?.email || "User"}
            </p>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-dim transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
