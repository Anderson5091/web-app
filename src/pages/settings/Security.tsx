import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import {
  ArrowLeft, Lock, Fingerprint, Smartphone,
  Bell, Eye, EyeOff, CheckCircle, Delete,
  ChevronRight
} from "lucide-react";

function strengthInfo(pwd: string) {
  if (!pwd) return { level: 0, label: "", color: "bg-border", bars: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "bg-danger", bars: 1 };
  if (score === 2) return { level: 2, label: "Fair", color: "bg-[#F5A623]", bars: 2 };
  if (score === 3) return { level: 3, label: "Good", color: "bg-[#00D6A3]", bars: 3 };
  return { level: 4, label: "Strong", color: "bg-primary", bars: 4 };
}

const requirements = [
  { label: "8+ characters", check: (s: string) => s.length >= 8 },
  { label: "Uppercase letter", check: (s: string) => /[A-Z]/.test(s) },
  { label: "Number (0–9)", check: (s: string) => /[0-9]/.test(s) },
  { label: "Special character", check: (s: string) => /[^A-Za-z0-9]/.test(s) },
];

function Toggle({
  value,
  onChange,
  icon: Icon,
  label,
  subtitle,
  color,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-border last:border-0">
      <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: color + "20" }}>
        <span style={{ color }}>
          <Icon size={18} />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium">{label}</p>
        <p className="text-text-subtle text-xs mt-0.5">{subtitle}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${value ? "bg-primary" : "bg-border"}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function Security() {
  const navigate = useNavigate();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [txPinEnabled, setTxPinEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const str = strengthInfo(newPwd);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!currentPwd) e.currentPwd = "Current password is required";
    if (!newPwd) e.newPwd = "New password is required";
    else if (newPwd.length < 8) e.newPwd = "Must be at least 8 characters";
    else if (!/[A-Z]/.test(newPwd)) e.newPwd = "Must contain an uppercase letter";
    else if (!/[0-9]/.test(newPwd)) e.newPwd = "Must contain a number";
    if (newPwd !== confirmPwd) e.confirmPwd = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put("/auth/password", { currentPassword: currentPwd, newPassword: newPwd });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      if (err?.response?.data?.error) {
        setErrors({ currentPwd: err.response.data.error });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/settings")} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Security</h1>
            <p className="text-text-secondary text-sm">Account Protection</p>
          </div>
        </div>

        {/* Security Score */}
        <div className="bg-gradient-to-br from-[#1A2640] to-[#151B2B] rounded-xl p-5 border border-border mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#F5A623]/20 border-2 border-[#F5A623] flex items-center justify-center shrink-0">
              <span className="text-[#F5A623] text-xl font-bold">72</span>
            </div>
            <div>
              <p className="text-text-primary text-base font-semibold">Security Score</p>
              <p className="text-text-secondary text-xs mt-0.5">Enable MFA to reach 95+</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? "bg-[#F5A623]" : "bg-border"}`} />
            ))}
          </div>
        </div>

        {/* Change Password */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Change Password</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
          <div className="p-4 space-y-4">
            {/* Current Password */}
            <div>
              <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Current Password</p>
              <div className={`flex items-center bg-card border ${errors.currentPwd ? "border-danger" : "border-border"} rounded-md px-3 h-[48px] focus-within:border-primary`}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder-text-subtle"
                />
                <button onClick={() => setShowPwd(!showPwd)} className="text-text-subtle hover:text-text-secondary p-1">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPwd && <p className="text-danger text-xs mt-1">{errors.currentPwd}</p>}
            </div>

            {/* New Password */}
            <div>
              <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">New Password</p>
              <div className={`flex items-center bg-card border ${errors.newPwd ? "border-danger" : "border-border"} rounded-md px-3 h-[48px] focus-within:border-primary`}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="At least 8 characters"
                  className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder-text-subtle"
                />
                <button onClick={() => setShowPwd(!showPwd)} className="text-text-subtle hover:text-text-secondary p-1">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPwd && <p className="text-danger text-xs mt-1">{errors.newPwd}</p>}
            </div>

            {/* Strength */}
            {newPwd.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full ${i <= str.bars ? str.color.replace("bg-", "bg-") : "bg-border"}`} style={{ backgroundColor: i <= str.bars ? (str.color.includes("danger") ? "#FF4E4E" : str.color.includes("F5A623") ? "#F5A623" : str.color.includes("primary") ? "#00D6A3" : "#00D6A3") : undefined }} />
                  ))}
                </div>
                <span className="text-xs font-semibold w-12 text-right" style={{ color: str.level >= 3 ? "#00D6A3" : str.level === 2 ? "#F5A623" : "#FF4E4E" }}>{str.label}</span>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Confirm New Password</p>
              <div className={`flex items-center bg-card border ${errors.confirmPwd ? "border-danger" : "border-border"} rounded-md px-3 h-[48px] focus-within:border-primary`}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Repeat new password"
                  className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder-text-subtle"
                />
              </div>
              {errors.confirmPwd && <p className="text-danger text-xs mt-1">{errors.confirmPwd}</p>}
            </div>

            {/* Requirements */}
            <div className="space-y-1.5">
              {requirements.map((r) => {
                const met = r.check(newPwd);
                return (
                  <div key={r.label} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${met ? "border-primary bg-primary/10" : "border-text-subtle"}`}>
                      {met && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className={`text-xs ${met ? "text-primary" : "text-text-subtle"}`}>{r.label}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
            >
              {saving ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : "Update Password"}
            </button>

            {success && (
              <div className="flex items-center justify-center gap-1.5 text-primary text-sm font-semibold animate-pulse">
                <CheckCircle size={16} />
                Password updated successfully
              </div>
            )}
          </div>
        </div>

        {/* Authentication */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Authentication</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
          <Toggle icon={Smartphone} label="Two-Factor Auth (MFA)" subtitle="Authenticator app or SMS" color="#00D6A3" value={mfaEnabled} onChange={setMfaEnabled} />
          <Toggle icon={Fingerprint} label="Biometric Login" subtitle="Face ID / Fingerprint unlock" color="#0084FF" value={bioEnabled} onChange={setBioEnabled} />
          <Toggle icon={Lock} label="Transaction PIN" subtitle="Require PIN to confirm transfers" color="#F5A623" value={txPinEnabled} onChange={setTxPinEnabled} />
          <Toggle icon={Bell} label="Login Alerts" subtitle="Email alerts for new sign-ins" color="#A78BFA" value={loginAlerts} onChange={setLoginAlerts} />
        </div>

        {/* Danger Zone */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Danger Zone</p>
        <button
          onClick={() => {}}
          className="w-full flex items-center gap-3 bg-danger-dim rounded-xl p-4 border border-danger/25 hover:bg-danger/20 transition-colors text-left"
        >
          <Delete size={20} className="text-danger shrink-0" />
          <div className="flex-1">
            <p className="text-danger text-sm font-semibold">Delete Account</p>
            <p className="text-text-subtle text-xs mt-0.5">Permanently remove your account and all data</p>
          </div>
          <ChevronRight size={20} className="text-danger shrink-0" />
        </button>
      </div>
    </div>
  );
}
