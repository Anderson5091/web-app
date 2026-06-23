import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";
import {
  Shield, CheckCircle2, XCircle, User, BadgeCheck, Home,
  CloudUpload, ArrowLeft, Loader2, ExternalLink, Camera, Trash2
} from "lucide-react";

const TIERS = [
  { tier: 0, name: "Unverified", limit: "$0 / month", desc: "No transactions until verified", color: "#FF4E4E", icon: XCircle },
  { tier: 1, name: "Basic Identity", limit: "$500 / month", desc: "Name, DOB, nationality", color: "#F5A623", icon: User },
  { tier: 2, name: "Gov. ID Verified", limit: "$5,000 / month", desc: "Government-issued ID upload", color: "#0084FF", icon: BadgeCheck },
  { tier: 3, name: "Full Verification", limit: "Unlimited", desc: "Address proof + EDD questionnaire", color: "#00D6A3", icon: Shield },
];

function TierIcon({ icon: Icon, color }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string }) {
  return <Icon size={22} style={{ color }} />;
}

export default function KYC() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user?.name || "");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");

  const [docType, setDocType] = useState("passport");
  const [docNumber, setDocNumber] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [address, setAddress] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");

  const currentTier = user?.kycTier || 0;
  const kycStatus = user?.kycStatus || "none";
  const currentTierInfo = TIERS[currentTier];

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    if (activeTab === 2 && selfie) {
      try {
        const { complianceApi } = await import("../../features/compliance/compliance.api");
        await complianceApi.uploadDocument("SELFIE", selfie);
      } catch { /* silent */ }
    }

    await new Promise(r => setTimeout(r, 1500));
    const newTier = activeTab as 0 | 1 | 2 | 3;
    updateUser({ ...user, kycTier: newTier, kycStatus: "approved" });
    setSubmitting(false);
    setSuccessMsg(`KYC Tier ${activeTab} verification approved. Your limits have been updated.`);
  };

  const isCurrentOrHigher = currentTier >= activeTab;

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-text-primary text-2xl font-bold mb-1">KYC Verification</h1>
        <p className="text-text-secondary text-sm mb-6">Identity Verification</p>

        {successMsg && (
          <div className="flex items-center gap-3 bg-primary-dim border border-primary-border rounded-lg p-4 mb-5">
            <CheckCircle2 size={20} className="text-primary shrink-0" />
            <p className="text-primary text-sm flex-1">{successMsg}</p>
            <button onClick={() => setSuccessMsg(null)} className="text-primary/60 hover:text-primary font-bold text-lg leading-none">&times;</button>
          </div>
        )}

        {/* Status Card */}
        <div
          className="rounded-xl p-5 flex items-center justify-between mb-5 border border-border"
          style={{
            background: currentTier >= 2
              ? "linear-gradient(135deg, #00D6A3, #0084FF)"
              : "linear-gradient(135deg, #1A2640, #151B2B)",
          }}
        >
          <div className="flex items-center gap-4">
            <TierIcon icon={currentTierInfo.icon} color="#fff" />
            <div>
              <p className="text-white text-lg font-bold">{currentTierInfo.name}</p>
              <p className="text-white/70 text-xs mt-0.5">{currentTierInfo.limit}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: kycStatus === "approved" ? "rgba(0,0,0,0.25)" : "rgba(245,166,35,0.2)" }}
            >
              <span className="text-white text-xs font-semibold">
                {kycStatus === "approved" ? "Verified" : kycStatus === "pending" ? "Pending" : "Unverified"}
              </span>
            </div>
            <button
              onClick={() => navigate("/compliance")}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium transition-colors"
            >
              <ExternalLink size={12} />
              More Details
            </button>
          </div>
        </div>

        {/* Tier Tabs */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t as 1 | 2 | 3)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-md border text-sm font-medium transition-colors ${
                activeTab === t
                  ? "border-primary bg-primary-dim text-primary"
                  : "border-border bg-card text-text-secondary"
              }`}
            >
              Tier {t}
              {currentTier >= t && <CheckCircle2 size={12} className="text-primary" />}
            </button>
          ))}
        </div>

        {/* Tier Info Card */}
        <div className="bg-card rounded-lg border border-border p-4 mb-5">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-md flex items-center justify-center"
              style={{ backgroundColor: TIERS[activeTab].color + "20" }}
            >
              <TierIcon icon={TIERS[activeTab].icon} color={TIERS[activeTab].color} />
            </div>
            <div>
              <p className="text-text-primary text-base font-semibold">{TIERS[activeTab].name}</p>
              <p className="text-text-secondary text-xs mt-0.5">Limit: {TIERS[activeTab].limit}</p>
            </div>
          </div>
          <p className="text-text-subtle text-sm">{TIERS[activeTab].desc}</p>
        </div>

        {/* Forms */}
        {activeTab === 1 && (
          <div className="mb-5">
            <h3 className="text-text-primary text-lg font-semibold mb-1">Basic Identity (Tier 1)</h3>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Full Legal Name</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="As on official documents"
                  className="w-full bg-card border border-border rounded-md px-4 h-[52px] text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Date of Birth</label>
                <input
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full bg-card border border-border rounded-md px-4 h-[52px] text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Nationality</label>
                <input
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                  placeholder="Country of nationality"
                  className="w-full bg-card border border-border rounded-md px-4 h-[52px] text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="mb-5">
            <h3 className="text-text-primary text-lg font-semibold mb-1">Government ID (Tier 2)</h3>
            <p className="text-text-secondary text-sm mb-4">Select your document type and enter details.</p>
            <div className="flex gap-2 mb-4">
              {[
                { key: "passport", label: "📕 Passport" },
                { key: "drivers_license", label: "🪪 Driver" },
                { key: "national_id", label: "🪪 National ID" },
              ].map(d => (
                <button
                  key={d.key}
                  onClick={() => setDocType(d.key)}
                  className={`flex-1 py-2.5 rounded-md border text-[10px] font-medium transition-colors ${
                    docType === d.key
                      ? "border-primary bg-primary-dim text-primary"
                      : "border-border bg-card text-text-secondary"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-text-secondary text-sm font-medium mb-1.5">Document Number</label>
              <input
                value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
                placeholder="Enter document number"
                className="w-full bg-card border border-border rounded-md px-4 h-[52px] text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="rounded-lg border-2 border-dashed border-border p-8 flex flex-col items-center gap-1 bg-card mb-4">
              <CloudUpload size={32} className="text-text-subtle" />
              <p className="text-text-secondary text-sm">Document upload (simulated)</p>
              <p className="text-text-subtle text-xs">PNG, JPG, PDF • Max 10MB</p>
            </div>

            <h4 className="text-text-primary text-sm font-semibold mb-3">Selfie Verification</h4>
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setSelfie(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
            {selfie ? (
              <div className="relative rounded-lg overflow-hidden border border-border mb-4">
                <img src={selfie} alt="Selfie" className="w-full h-48 object-cover" />
                <button
                  onClick={() => { setSelfie(null); if (selfieInputRef.current) selfieInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => selfieInputRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-border p-8 flex flex-col items-center gap-1 bg-card mb-4 hover:border-primary/50 transition-colors"
              >
                <Camera size={32} className="text-text-subtle" />
                <p className="text-text-secondary text-sm">Take a selfie</p>
                <p className="text-text-subtle text-xs">Use your camera to capture your face</p>
              </button>
            )}
          </div>
        )}

        {activeTab === 3 && (
          <div className="mb-5">
            <h3 className="text-text-primary text-lg font-semibold mb-1">Address + EDD (Tier 3)</h3>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Residential Address</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Full address"
                  rows={3}
                  className="w-full bg-card border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Source of Funds</label>
                <input
                  value={sourceOfFunds}
                  onChange={e => setSourceOfFunds(e.target.value)}
                  placeholder="e.g., Salary, Business income"
                  className="w-full bg-card border border-border rounded-md px-4 h-[52px] text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="rounded-lg border-2 border-dashed border-border p-8 flex flex-col items-center gap-1 bg-card">
                <Home size={32} className="text-text-subtle" />
                <p className="text-text-secondary text-sm">Proof of address upload (simulated)</p>
              </div>
            </div>
          </div>
        )}

        {isCurrentOrHigher ? (
          <div className="flex items-center gap-3 bg-primary-dim rounded-md p-4 border border-primary-border">
            <CheckCircle2 size={20} className="text-primary shrink-0" />
            <p className="text-primary text-sm">You already have Tier {activeTab} or higher verification.</p>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center text-white text-base font-bold tracking-wide transition-opacity disabled:opacity-50 hover:opacity-90"
          >
            {submitting ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              `Submit Tier ${activeTab} Verification`
            )}
          </button>
        )}
      </div>
    </div>
  );
}
