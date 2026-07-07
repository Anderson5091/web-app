import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";
import { useComplianceStore } from "../../features/compliance/compliance.store";
import {
  Shield, CheckCircle2, XCircle, User, BadgeCheck, Home,
  CloudUpload, ArrowLeft, Loader2, ExternalLink, Camera, Trash2, AlertTriangle, Info
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
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;
  const { user, updateUser } = useAuthStore();
  const { kycStatus, isSubmitting, submitResult, error, fetchStatus, submitTier1, submitTier2, submitTier3, clearResult, clearError } = useComplianceStore();

  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");

  const [docType, setDocType] = useState("passport");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [docFront, setDocFront] = useState<string | null>(null);
  const [docBack, setDocBack] = useState<string | null>(null);
  const [proofAddress, setProofAddress] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const docFrontRef = useRef<HTMLInputElement>(null);
  const docBackRef = useRef<HTMLInputElement>(null);
  const proofAddressRef = useRef<HTMLInputElement>(null);

  const [sourceOfFunds, setSourceOfFunds] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  const currentTier = kycStatus?.userTier ?? user?.kycTier ?? 0;
  const kycUserStatus = kycStatus?.userStatus ?? user?.kycStatus ?? "none";
  const currentTierInfo = TIERS[currentTier];

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    clearResult();
    clearError();
    setSuccessMsg(null);

    if (activeTab === 1) {
      const result = await submitTier1({
        fullName,
        dateOfBirth: dob,
        nationality,
        country: country || nationality,
        address,
      });
      if (result) {
        if (result.status === "APPROVED") {
          updateUser({ ...user, kycTier: 1, kycStatus: "approved" });
          setSuccessMsg("Tier 1 verified! Your basic identity has been confirmed.");
        } else if (result.status === "IN_REVIEW") {
          setSuccessMsg("Tier 1 submitted for manual review due to AML flags.");
        } else {
          setSuccessMsg("Tier 1 submitted for review.");
        }
        await fetchStatus();
      }
    }

    if (activeTab === 2) {
      if (!docFront || !selfie) return;
      try {
        const idImage = docFront.includes(",") ? docFront.split(",")[1] : docFront;
        const selfieImage = selfie.includes(",") ? selfie.split(",")[1] : selfie;
        const payload: any = {
          idImage,
          selfieImage,
          documentType: docType === "passport" ? "PASSPORT" : docType === "drivers_license" ? "DRIVER_LICENSE" : "NATIONAL_ID",
        };
        if (docBack) {
          payload.idImageBack = docBack.includes(",") ? docBack.split(",")[1] : docBack;
        }
        const result = await submitTier2(payload);
        if (result) {
          if (result.status === "APPROVED") {
            updateUser({ ...user, kycTier: 2, kycStatus: "approved" });
            setSuccessMsg("Tier 2 verified! Your identity documents have been confirmed.");
          } else {
            setSuccessMsg("Tier 2 verification did not pass. Check the details below.");
          }
          await fetchStatus();
        }
      } catch { /* handled by store */ }
    }

    if (activeTab === 3) {
      if (!proofAddress) return;
      try {
        const poaImage = proofAddress.includes(",") ? proofAddress.split(",")[1] : proofAddress;
        const result = await submitTier3({
          poaImage,
          sourceOfFunds: sourceOfFunds || undefined,
        });
        if (result) {
          if (result.status === "APPROVED") {
            updateUser({ ...user, kycTier: 3, kycStatus: "approved" });
            setSuccessMsg("Tier 3 verified! You now have full access.");
          } else {
            setSuccessMsg("Tier 3 verification did not pass. Check the details below.");
          }
          await fetchStatus();
        }
      } catch { /* handled by store */ }
    }
  };

  const isCurrentOrHigher = currentTier >= activeTab;

  const renderScores = (details: any) => {
    if (!details) return null;
    const items: { label: string; value: string | number; ok: boolean }[] = [];
    if (details.aml) {
      items.push({ label: "AML Screening", value: `${details.aml.total_hits ?? 0} hits`, ok: (details.aml.total_hits ?? 0) === 0 });
    }
    if (details.database) {
      items.push({ label: "Database Match", value: `${details.database.match_rate ?? 0}%`, ok: (details.database.match_rate ?? 0) >= 80 });
    }
    if (details.idVerification) {
      items.push({ label: "ID Verification", value: details.idVerification.status, ok: details.idVerification.status === "Approved" });
    }
    if (details.liveness) {
      items.push({ label: "Liveness", value: `${details.liveness.score ?? 0}%`, ok: (details.liveness.score ?? 0) >= 70 });
    }
    if (details.faceMatch) {
      items.push({ label: "Face Match", value: `${details.faceMatch.score ?? 0}%`, ok: (details.faceMatch.score ?? 0) >= 70 });
    }
    if (details.poa) {
      items.push({ label: "Proof of Address", value: details.poa.status, ok: details.poa.status === "Approved" });
    }
    return (
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm bg-card-alt rounded-lg px-3 py-2 border border-border">
            <span className="text-text-secondary">{item.label}</span>
            <span className={`font-semibold flex items-center gap-1.5 ${item.ok ? "text-primary" : "text-danger"}`}>
              {item.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          {from && (
            <button onClick={() => navigate(from)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors">
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
          )}
          <div>
            <h1 className="text-text-primary text-2xl font-bold">KYC Verification</h1>
            <p className="text-text-secondary text-sm">Identity Verification</p>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-3 bg-primary-dim border border-primary-border rounded-lg p-4 mb-5">
            <CheckCircle2 size={20} className="text-primary shrink-0" />
            <p className="text-primary text-sm flex-1">{successMsg}</p>
            <button onClick={() => setSuccessMsg(null)} className="text-primary/60 hover:text-primary font-bold text-lg leading-none">&times;</button>
          </div>
        )}

        {submitResult && submitResult.status !== "APPROVED" && (
          <div className="flex items-start gap-3 bg-warning-dim border border-warning/25 rounded-lg p-4 mb-5">
            <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-warning text-sm font-semibold">Verification: {submitResult.status}</p>
              {renderScores(submitResult.details)}
            </div>
          </div>
        )}

        {submitResult && submitResult.status === "APPROVED" && (
          <div className="flex items-start gap-3 bg-primary-dim border border-primary-border rounded-lg p-4 mb-5">
            <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-primary text-sm font-semibold">Approved! Now at Tier {submitResult.tier}</p>
              {renderScores(submitResult.details)}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-danger-dim border border-danger/25 rounded-lg p-4 mb-5">
            <XCircle size={20} className="text-danger shrink-0" />
            <p className="text-danger text-sm flex-1">{error}</p>
          </div>
        )}

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
              style={{ backgroundColor: kycUserStatus === "approved" ? "rgba(0,0,0,0.25)" : "rgba(245,166,35,0.2)" }}
            >
              <span className="text-white text-xs font-semibold">
                {kycUserStatus === "approved" ? "Verified" : kycUserStatus === "pending" || kycUserStatus === "in_review" ? "In Review" : "Unverified"}
              </span>
            </div>
            <button
              onClick={() => navigate("/compliance", { state: { from: "/compliance/kyc", kycFrom: from || "/" } })}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium transition-colors"
            >
              <ExternalLink size={12} />
              More Details
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(t => (
            <button
              key={t}
              onClick={() => { setActiveTab(t as 1 | 2 | 3); clearResult(); clearError(); }}
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
                  placeholder="YYYY-MM-DD"
                  className="w-full bg-card border border-border rounded-md px-4 h-[52px] text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Nationality</label>
                <input
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                  placeholder="e.g., Haitian, American"
                  className="w-full bg-card border border-border rounded-md px-4 h-[52px] text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Country of Residence</label>
                <input
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="e.g., Haiti, United States"
                  className="w-full bg-card border border-border rounded-md px-4 h-[52px] text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Full Address</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street, city, postal code"
                  rows={3}
                  className="w-full bg-card border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="mb-5">
            <h3 className="text-text-primary text-lg font-semibold mb-1">Government ID (Tier 2)</h3>
            <p className="text-text-secondary text-sm mb-4">Upload your ID document and take a selfie.</p>
            <div className="flex gap-2 mb-4">
              {[
                { key: "passport", label: "Passport" },
                { key: "drivers_license", label: "Driver License" },
                { key: "national_id", label: "National ID" },
              ].map(d => (
                <button
                  key={d.key}
                  onClick={() => { setDocType(d.key); setDocFront(null); setDocBack(null); }}
                  className={`flex-1 py-2.5 rounded-md border text-xs font-medium transition-colors ${
                    docType === d.key
                      ? "border-primary bg-primary-dim text-primary"
                      : "border-border bg-card text-text-secondary"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <label className="block text-text-secondary text-sm font-medium mb-1.5">
              {docType === "passport" ? "Upload Passport Page" : "Upload Front Side"}
            </label>
            <input
              ref={docFrontRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const b64 = await toBase64(file);
                  setDocFront(b64);
                }
              }}
            />
            {docFront ? (
              <div className="relative rounded-lg overflow-hidden border border-border mb-4">
                <img src={`data:image/jpeg;base64,${docFront}`} alt="ID front" className="w-full h-36 object-cover" />
                <button
                  onClick={() => { setDocFront(null); if (docFrontRef.current) docFrontRef.current.value = ""; }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => docFrontRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-border p-6 flex flex-col items-center gap-1 bg-card mb-4 hover:border-primary/50 transition-colors"
              >
                <CloudUpload size={28} className="text-text-subtle" />
                <p className="text-text-secondary text-xs">Tap to upload {docType === "passport" ? "passport page" : "front side"}</p>
                <p className="text-text-subtle text-[10px]">PNG, JPG</p>
              </button>
            )}

            {docType !== "passport" && (
              <>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Upload Back Side</label>
                <input
                  ref={docBackRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const b64 = await toBase64(file);
                      setDocBack(b64);
                    }
                  }}
                />
                {docBack ? (
                  <div className="relative rounded-lg overflow-hidden border border-border mb-4">
                    <img src={`data:image/jpeg;base64,${docBack}`} alt="ID back" className="w-full h-36 object-cover" />
                    <button
                      onClick={() => { setDocBack(null); if (docBackRef.current) docBackRef.current.value = ""; }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => docBackRef.current?.click()}
                    className="w-full rounded-lg border-2 border-dashed border-border p-6 flex flex-col items-center gap-1 bg-card mb-4 hover:border-primary/50 transition-colors"
                  >
                    <CloudUpload size={28} className="text-text-subtle" />
                    <p className="text-text-secondary text-xs">Tap to upload back side</p>
                    <p className="text-text-subtle text-[10px]">PNG, JPG</p>
                  </button>
                )}
              </>
            )}

            <label className="block text-text-secondary text-sm font-medium mb-1.5">Selfie</label>
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const b64 = await toBase64(file);
                  setSelfie(b64);
                }
              }}
            />
            {selfie ? (
              <div className="relative rounded-lg overflow-hidden border border-border mb-4">
                <img src={`data:image/jpeg;base64,${selfie}`} alt="Selfie" className="w-full h-48 object-cover" />
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
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Source of Funds</label>
                <input
                  value={sourceOfFunds}
                  onChange={e => setSourceOfFunds(e.target.value)}
                  placeholder="e.g., Salary, Business income"
                  className="w-full bg-card border border-border rounded-md px-4 h-[52px] text-text-primary placeholder-text-subtle text-base outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Proof of Address</label>
                <input
                  ref={proofAddressRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const b64 = await toBase64(file);
                      setProofAddress(b64);
                    }
                  }}
                />
                {proofAddress ? (
                  <div className="relative rounded-lg overflow-hidden border border-border mb-4">
                    <img src={`data:image/jpeg;base64,${proofAddress}`} alt="Proof of address" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => { setProofAddress(null); if (proofAddressRef.current) proofAddressRef.current.value = ""; }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => proofAddressRef.current?.click()}
                    className="w-full rounded-lg border-2 border-dashed border-border p-6 flex flex-col items-center gap-1 bg-card hover:border-primary/50 transition-colors"
                  >
                    <Home size={28} className="text-text-subtle" />
                    <p className="text-text-secondary text-xs">Tap to upload proof of address</p>
                    <p className="text-text-subtle text-[10px]">Utility bill, bank statement</p>
                  </button>
                )}
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
            disabled={isSubmitting}
            className="w-full h-14 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center text-white text-base font-bold tracking-wide transition-opacity disabled:opacity-50 hover:opacity-90"
          >
            {isSubmitting ? (
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
