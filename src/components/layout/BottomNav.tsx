import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, Send, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { path: "/home", icon: LayoutDashboard, label: "Home" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/wallet/transfer", icon: Send, label: "Send", center: true },
  { path: "/beneficiaries", icon: Users, label: "Recipients" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          if (item.center) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative -top-4"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-[#00D6A3] to-[#0084FF] rounded-full flex items-center justify-center shadow-lg shadow-[#00D6A3]/30 hover:shadow-[#00D6A3]/50 transition-shadow active:scale-95">
                  <Icon size={24} className="text-white" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[64px] ${
                isActive ? "text-primary" : "text-text-subtle hover:text-text-secondary"
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
