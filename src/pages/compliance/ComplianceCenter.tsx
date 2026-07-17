import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useComplianceStore } from "../../features/compliance/compliance.store";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  Scale,
  Ban,
  ArrowUpRight,
  ArrowLeft,
  Info,
} from "lucide-react";
import { CURRENCY_TOKEN } from "../../config/constants";

// ─── Helpers ───────────────────────────────────────────────────────────────

const tierLabels = ["Unverified", "Basic", "Verified", "Enhanced"];
const tierDescriptions = [
  "No transactions until verified",
  "Limited sending ($500/month)",
  "Medium limits ($5,000/month)",
  "High limits (unlimited)",
];



type StatusKey = "APPROVED" | "PENDING" | "REJECTED";

const statusConfig: Record<
  StatusKey,
  { label: string; bg: string; text: string; border: string; icon: typeof CheckCircle2 }
> = {
  APPROVED: {
    label: "Approved",
    bg: "bg-primary-dim",
    text: "text-primary",
    border: "border-primary-border",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Pending Review",
    bg: "bg-warning-dim",
    text: "text-warning",
    border: "border-warning/25",
    icon: Clock,
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-danger-dim",
    text: "text-danger",
    border: "border-danger/25",
    icon: XCircle,
  },
};

// ─── Section card wrapper ───────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  iconColor = "text-primary",
  children,
  action,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-text-primary font-semibold flex items-center gap-2">
          <Icon size={18} className={iconColor} />
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ComplianceCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; kycFrom?: string } | null;
  const fromKyc = state?.from === "/compliance/kyc";
  const kycFrom = state?.kycFrom || "/compliance";
  const {
    kycStatus,
    isLoading,
    fetchStatus,
  } = useComplianceStore();

  const riskColor = "#00D6A3";

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading && !kycStatus) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-text-secondary font-medium">Loading compliance data…</p>
        </div>
      </div>
    );
  }

  const profile = kycStatus?.profile;
  const limits = kycStatus?.limits;
  const currentTier = kycStatus?.userTier ?? 0;
  const currentStatus = kycStatus?.userStatus ?? "none";

  const statusKey: StatusKey =
    currentStatus === "approved" ? "APPROVED" :
    currentStatus === "rejected" ? "REJECTED" : "PENDING";

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-4xl mx-auto p-4 pb-24 space-y-5">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {fromKyc && (
            <button
              onClick={() => navigate("/compliance/kyc", { state: { from: "/compliance" } })}
              className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
          )}
          <div>
            <h1 className="text-text-primary text-2xl font-bold flex items-center gap-2">
              <Shield size={24} className="text-primary" />
              Compliance Center
            </h1>
            <p className="text-text-secondary text-sm">
              KYC verification, AML screening &amp; risk management
            </p>
          </div>
        </div>

        {/* ── Toast message ─────────────────────────────────────────────── */}
        {kycStatus?.lastEvent && (
          <div className="flex items-center gap-3 bg-primary-dim border border-primary-border rounded-xl p-4 text-sm text-primary font-medium">
            <Info size={18} className="shrink-0" />
            <span className="flex-1">Last event: {kycStatus.lastEvent.eventType} — {kycStatus.lastEvent.status}</span>
            <button
              onClick={() => {}}
              className="text-primary/60 hover:text-primary font-bold text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}

        {/* ── Top grid: KYC Profile + Risk Score ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* KYC Profile Card */}
          <div className="lg:col-span-2">
            <SectionCard
              title="KYC Profile"
              icon={FileText}
              action={
                profile ? (
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[profile.status as StatusKey].bg} ${statusConfig[profile.status as StatusKey].text} ${statusConfig[profile.status as StatusKey].border}`}
                  >
                    {React.createElement(statusConfig[profile.status as StatusKey].icon, { size: 12 })}
                    {statusConfig[profile.status as StatusKey].label}
                  </span>
                ) : undefined
              }
            >
              {profile ? (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">
                        Full Name
                      </p>
                      <p className="text-text-primary font-semibold">{profile.fullName}</p>
                    </div>
                    <div>
                      <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">
                        Country
                      </p>
                      <p className="text-text-primary font-semibold">{profile.country}</p>
                    </div>
                    <div>
                      <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">
                        Date of Birth
                      </p>
                      <p className="text-text-primary font-semibold">{profile.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">
                        Current Tier
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary-dim text-primary border border-primary-border">
                        Tier {profile.tier}: {tierLabels[profile.tier]}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">
                        Address
                      </p>
                      <p className="text-text-primary font-semibold">{profile.address}</p>
                    </div>
                  </div>

                  {/* Tier upgrade */}
                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-semibold text-sm">Upgrade to Tier {currentTier + 1}</p>
                      <p className="text-text-subtle text-xs mt-0.5">{tierDescriptions[currentTier + 1] || "Complete all verifications"}</p>
                    </div>
                    <button
                      onClick={() => navigate("/compliance/kyc", { state: { from: "/compliance" } })}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      <ArrowUpRight size={15} />
                      Upgrade
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-text-subtle text-sm text-center py-6">No KYC profile found.</p>
              )}
            </SectionCard>
          </div>

          {/* Current Tier Card */}
          <SectionCard title="Current Status" icon={Shield}>
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#1F2937" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={riskColor}
                    strokeWidth="8"
                    strokeDasharray={`${(currentTier / 3) * 327} 327`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-text-primary">T{currentTier}</span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[statusKey].bg} ${statusConfig[statusKey].text} ${statusConfig[statusKey].border}`}
              >
                {React.createElement(statusConfig[statusKey].icon, { size: 11 })}
                {statusConfig[statusKey].label}
              </span>

              <div className="mt-4 w-full space-y-1.5 text-center">
                <p className="text-xs text-text-secondary font-medium">{tierLabels[currentTier]}</p>
                <p className="text-xs text-text-subtle">{tierDescriptions[currentTier]}</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Limits + Next Tier Info ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Send Limits */}
          <SectionCard title="Send Limits" icon={Scale}>
            {limits ? (
              <div className="space-y-5">
                {/* Daily */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-text-secondary font-medium">Daily Limit</span>
                    <span className="text-text-primary font-bold">
                      ${limits.dailySend.toLocaleString()} {CURRENCY_TOKEN}
                    </span>
                  </div>
                </div>
                {/* Monthly */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-text-secondary font-medium">Monthly Limit</span>
                    <span className="text-text-primary font-bold">
                      ${limits.monthlySend.toLocaleString()} {CURRENCY_TOKEN}
                    </span>
                  </div>
                  <div className="h-2 bg-card-alt rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (currentTier / 3) * 100)}%` }}
                    />
                  </div>
                </div>
                {kycStatus?.nextTier && (
                  <p className="text-text-subtle text-xs">Complete Tier {kycStatus.nextTier} to unlock higher limits.</p>
                )}
              </div>
            ) : (
              <p className="text-text-subtle text-sm text-center py-4">No limit data.</p>
            )}
          </SectionCard>

          {/* AML status from last event */}
          <SectionCard title="Verification Status" icon={Ban}>
            {kycStatus?.lastEvent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm font-medium">Last Event</span>
                  <span className="text-text-primary font-bold text-sm">{kycStatus.lastEvent.eventType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm font-medium">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                      kycStatus.lastEvent.status === "APPROVED"
                        ? "bg-primary-dim text-primary border-primary-border"
                        : kycStatus.lastEvent.status === "DECLINED"
                        ? "bg-danger-dim text-danger border-danger/25"
                        : "bg-warning-dim text-warning border-warning/25"
                    }`}
                  >
                    {kycStatus.lastEvent.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm font-medium">Provider</span>
                  <span className="text-text-primary text-sm font-medium">{kycStatus.lastEvent.provider}</span>
                </div>
              </div>
            ) : (
              <p className="text-text-subtle text-sm text-center py-4">No verification data yet.</p>
            )}
          </SectionCard>
        </div>

        {/* ── KYC Tier Status ──────────────────────────────────────────── */}
        <SectionCard
          title="KYC Tier Status"
          icon={Shield}
          action={
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[statusKey].bg} ${statusConfig[statusKey].text} ${statusConfig[statusKey].border}`}
            >
              {React.createElement(statusConfig[statusKey].icon, { size: 12 })}
              {statusConfig[statusKey].label}
            </span>
          }
        >
          {profile ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 bg-card-alt rounded-lg border border-border">
                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-dim">
                  <Shield size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-text-primary font-semibold">
                    Tier {currentTier}: {tierLabels[currentTier]}
                  </p>
                  <p className="text-text-secondary text-xs mt-0.5">{tierDescriptions[currentTier]}</p>
                  <p className="text-text-subtle text-xs mt-0.5">
                    Limit: ${limits?.monthlySend?.toLocaleString() || "0"}/month
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-text-primary font-semibold">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="text-text-primary font-semibold">{profile.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Nationality</p>
                  <p className="text-text-primary font-semibold">{profile.nationality || profile.country}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Address</p>
                  <p className="text-text-primary font-semibold">{profile.address || "—"}</p>
                </div>
              </div>

              {currentTier < 3 && (
                <button
                  onClick={() => navigate("/compliance/kyc", { state: { from: kycFrom } })}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <ArrowUpRight size={16} />
                  Upgrade to Tier {currentTier + 1}: {tierLabels[currentTier + 1]}
                </button>
              )}

              {currentTier >= 3 && (
                <p className="text-center text-text-subtle text-sm py-2">You are at the highest tier.</p>
              )}
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <p className="text-text-subtle text-sm">No KYC profile found.</p>
              <button
                onClick={() => navigate("/compliance/kyc", { state: { from: kycFrom } })}
                className="inline-flex items-center gap-2 bg-primary-dim border border-primary-border rounded-lg px-4 py-2 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
              >
                Start Verification
              </button>
            </div>
          )}
        </SectionCard>

        {/* ── Event History ─────────────────────────────────────────── */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-text-primary font-semibold flex items-center gap-2">
              <Info size={18} className="text-primary" />
              Verification History
            </h2>
          </div>
          <div className="divide-y divide-border">
            {kycStatus?.lastEvent ? (
              <div className="flex items-center justify-between px-5 py-4 hover:bg-card-alt transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg border bg-card-alt border-border">
                    <CheckCircle2 size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-semibold">{kycStatus.lastEvent.eventType}</p>
                    <p className="text-text-subtle text-xs mt-0.5">
                      {kycStatus.lastEvent.provider} · {new Date(kycStatus.lastEvent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-primary-dim text-primary border border-primary-border">
                  {kycStatus.lastEvent.status}
                </span>
              </div>
            ) : (
              <div className="p-8 text-center text-text-subtle text-sm">No verification events yet.</div>
            )}
          </div>
        </div>

        {/* ── Compliance Rules ───────────────────────────────────────────── */}
        <SectionCard title="Compliance Rules" icon={FileText}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { title: "Sanctions Check", desc: "IF sanctions match → BLOCK immediately" },
              { title: "High Value Transfer", desc: "IF amount > $1,000 → REVIEW" },
              { title: "Velocity Check", desc: "IF frequency > 5/day → FLAG" },
              { title: "Tier 1 Restriction", desc: "IF KYC = Tier 1 AND amount high → BLOCK" },
              { title: "Critical Risk", desc: "IF risk level = CRITICAL → BLOCK" },
              { title: "High Risk Review", desc: "IF risk level = HIGH → REVIEW required" },
            ].map((rule) => (
              <div
                key={rule.title}
                className="p-3 bg-card-alt rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <p className="font-bold text-text-primary text-sm">{rule.title}</p>
                <p className="text-text-subtle text-xs mt-1">{rule.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
