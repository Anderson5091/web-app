import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";
import { useNotificationStore } from "../../features/notifications/notification.store";
import {
  User, Lock, Smartphone, Bell, Info, HelpCircle, FileText,
  ChevronRight, LogOut, Verified
} from "lucide-react";

interface SettingRow {
  icon: React.ComponentType<{ size?: number; className?: string; color?: string; style?: React.CSSProperties }>;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  toggle?: boolean;
  color?: string;
  rightText?: string;
}

function Row({ icon: Icon, label, subtitle, onPress, toggle, color, rightText }: SettingRow) {
  const [toggleValue, setToggleValue] = useState(false);

  return (
    <button
      onClick={toggle ? () => setToggleValue(!toggleValue) : onPress}
      className="w-full flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-card-alt transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: (color || "#00D6A3") + "20" }}>
        <Icon size={20} color={color || "#00D6A3"} />
      </div>
      <div className="flex-1">
        <p className="text-text-primary text-sm">{label}</p>
        {subtitle ? <p className="text-text-subtle text-xs mt-0.5">{subtitle}</p> : null}
      </div>
      {toggle ? (
        <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${toggleValue ? "bg-primary" : "bg-border"}`}>
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${toggleValue ? "translate-x-5" : "translate-x-0"}`} />
        </div>
      ) : rightText ? (
        <span className="text-text-secondary text-sm">{rightText}</span>
      ) : (
        <ChevronRight size={20} className="text-text-subtle" />
      )}
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { preferences, setPreference } = useNotificationStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const kycLabel = ["Not Started", "Tier 1 — Basic", "Tier 2 — ID Verified", "Tier 3 — Full"][user?.kycTier || 0];
  const kycColor = user?.kycStatus === "approved" ? "#00D6A3" : "#F5A623";

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <h1 className="text-text-primary text-2xl font-bold mb-6">Settings</h1>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[#1A2640] to-[#151B2B] rounded-xl p-5 border border-border flex items-center gap-4 mb-6">
          <div className="w-[52px] h-[52px] rounded-full bg-primary-dim border-2 border-primary-border flex items-center justify-center">
            <span className="text-primary text-xl font-bold">{user?.name?.[0] || "U"}</span>
          </div>
          <div className="flex-1">
            <p className="text-text-primary text-base font-bold">{user?.name || "User"}</p>
            <p className="text-text-secondary text-xs mt-0.5">{user?.email}</p>
          </div>
          <div
            className="px-2 py-1 rounded-full border text-[10px] font-semibold"
            style={{
              backgroundColor: kycColor + "20",
              borderColor: kycColor + "40",
              color: kycColor,
            }}
          >
            {kycLabel}
          </div>
        </div>

        {/* Verification */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Verification</p>
        <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
          <Row icon={Verified} label="KYC Verification" subtitle={kycLabel} onPress={() => navigate("/compliance/kyc", { state: { from: "/settings" } })} color="#A78BFA" rightText={user?.kycStatus === "approved" ? "Approved" : "Pending"} />
        </div>

        {/* Account */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Account</p>
        <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
          <Row icon={User} label="Profile" subtitle="Edit your personal info" onPress={() => navigate("/onboarding/profile")} color="#00D6A3" />
          <Row icon={Lock} label="Security" subtitle="Password, sessions" color="#0084FF" />
          <Row icon={Smartphone} label="Active Sessions" subtitle="Manage logged-in devices" color="#F5A623" />
        </div>

        {/* Notifications */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Notifications</p>
        <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
          <button
            className="w-full flex items-center gap-4 p-4 border-b border-border hover:bg-card-alt transition-colors text-left"
            onClick={() => setPreference("transferUpdates", !preferences.transferUpdates)}
          >
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary-dim">
              <Bell size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-text-primary text-sm">Transfer Updates</p>
              <p className="text-text-subtle text-xs mt-0.5">Status changes for your transfers</p>
            </div>
            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${preferences.transferUpdates ? "bg-primary" : "bg-border"}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.transferUpdates ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>
          <button
            className="w-full flex items-center gap-4 p-4 hover:bg-card-alt transition-colors text-left"
            onClick={() => setPreference("deposits", !preferences.deposits)}
          >
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary-dim">
              <Bell size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-text-primary text-sm">Deposits</p>
              <p className="text-text-subtle text-xs mt-0.5">Incoming funds alerts</p>
            </div>
            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${preferences.deposits ? "bg-primary" : "bg-border"}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.deposits ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>
        </div>

        {/* App */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">App</p>
        <div className="bg-card rounded-lg border border-border overflow-hidden mb-8">
          <Row icon={Info} label="App Version" rightText="1.0.0" color="#707B90" />
          <Row icon={HelpCircle} label="Help & Support" color="#707B90" />
          <Row icon={FileText} label="Privacy Policy" color="#707B90" />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-danger-dim rounded-lg p-4 border border-danger/25 text-danger text-base font-semibold hover:bg-danger/20 transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
