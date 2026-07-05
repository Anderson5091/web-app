import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";
import { ArrowLeft, Camera, Lock, CheckCircle, Shield, Calendar } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, fetchProfile, updateProfile } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setCountry(user.country || "");
    }
  }, [user]);

  const initials = (user?.fullName || user?.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const kycStatusMap: Record<string, { label: string; color: string }> = {
    none: { label: "Unverified", color: "#F5A623" },
    pending: { label: "Pending Review", color: "#F5A623" },
    approved: { label: `Tier ${user?.kycTier || 0}`, color: "#00D6A3" },
    rejected: { label: "Rejected", color: "#FF4E4E" },
  };
  const kycInfo = kycStatusMap[user?.kycStatus || "none"];

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ fullName: fullName.trim(), phone, country });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* error handled by interceptor */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Profile</h1>
            <p className="text-text-secondary text-sm">Personal Information</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center py-6 mb-6 relative">
          <div className="relative">
            <div className="w-22 h-22 rounded-full bg-gradient-to-br from-[#00D6A3] to-[#0084FF] p-[3px]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-primary text-[30px] font-bold">{initials}</span>
              </div>
            </div>
            <button className="absolute -bottom-0.5 right-0 w-6 h-6 rounded-full bg-[#00D6A3] flex items-center justify-center border-2 border-app-bg hover:opacity-80 transition-opacity">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <p className="text-text-primary text-lg font-bold mt-3">{user?.fullName || "Your Name"}</p>
          <p className="text-text-secondary text-sm">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { label: "KYC Level", value: kycInfo.label, icon: Shield, color: "#00D6A3" },
            { label: "Member Since", value: memberSince, icon: Calendar, color: "#0084FF" },
            { label: "Status", value: "Active", icon: CheckCircle, color: "#00D6A3" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-3 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "20" }}>
                <s.icon size={16} color={s.color} />
              </div>
              <p className="text-text-primary text-[10px] font-semibold text-center leading-tight">{s.value}</p>
              <p className="text-text-subtle text-[9px] text-center">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Personal Details</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
          <div className="divide-y divide-border">
            {/* Full Name */}
            <div className="px-4 py-3.5">
              <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Full Name</p>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full legal name"
                className="w-full bg-transparent text-text-primary text-sm outline-none placeholder-text-subtle"
              />
            </div>

            {/* Email (read-only) */}
            <div className="px-4 py-3.5">
              <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Email Address</p>
              <div className="flex items-center gap-2 bg-card-alt rounded-lg px-3 h-[44px] border border-border">
                <Lock size={14} className="text-text-subtle shrink-0" />
                <span className="text-text-subtle text-sm">{user?.email}</span>
              </div>
              <p className="text-text-subtle text-[10px] mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div className="px-4 py-3.5">
              <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Phone Number (optional)</p>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 000 000 0000"
                className="w-full bg-transparent text-text-primary text-sm outline-none placeholder-text-subtle"
              />
            </div>
          </div>
        </div>

        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Location</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
          <div className="px-4 py-3.5">
            <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Country</p>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Your country"
              className="w-full bg-transparent text-text-primary text-sm outline-none placeholder-text-subtle"
            />
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            "Save Changes"
          )}
        </button>

        {saved && (
          <div className="flex items-center justify-center gap-1.5 mt-4 text-primary text-sm font-semibold animate-pulse">
            <CheckCircle size={16} />
            Profile updated successfully
          </div>
        )}
      </div>
    </div>
  );
}
