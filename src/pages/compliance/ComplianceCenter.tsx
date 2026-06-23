import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useComplianceStore } from "../../features/compliance/compliance.store";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Upload,
  Loader2,
  Gauge,
  FileText,
  Scale,
  Ban,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────

const tierLabels = ["", "Basic", "Verified", "Enhanced"];
const tierDescriptions = [
  "",
  "Limited sending ($1K/day)",
  "Medium limits ($10K/day)",
  "High limits ($100K/day)",
];

const docTypeLabels: Record<string, string> = {
  PASSPORT: "Passport",
  NATIONAL_ID: "National ID",
  DRIVER_LICENSE: "Driver's License",
};

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

const riskStyle: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: "bg-primary-dim", text: "text-primary", border: "border-primary-border" },
  MEDIUM: { bg: "bg-warning-dim", text: "text-warning", border: "border-warning/25" },
  HIGH: { bg: "bg-danger-dim", text: "text-danger", border: "border-danger/25" },
  CRITICAL: { bg: "bg-danger-dim", text: "text-danger", border: "border-danger/25" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
    overview,
    documents,
    isLoading,
    isUploading,
    isUpgrading,
    uploadMessage,
    upgradeMessage,
    fetchOverview,
    uploadDocument,
    requestTierUpgrade,
    clearMessages,
  } = useComplianceStore();

  const [docType, setDocType] = useState("PASSPORT");

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading && !overview) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-text-secondary font-medium">Loading compliance data…</p>
        </div>
      </div>
    );
  }

  const profile = overview?.kycProfile;
  const risk = overview?.riskScore;
  const aml = overview?.amlCheck;
  const limits = overview?.limits;
  const riskGauge = risk ? risk.score : 0;
  const riskColor =
    risk?.level === "LOW"
      ? "#00D6A3"
      : risk?.level === "MEDIUM"
      ? "#F5A623"
      : "#FF4E4E";

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
        {(uploadMessage || upgradeMessage) && (
          <div className="flex items-center gap-3 bg-primary-dim border border-primary-border rounded-xl p-4 text-sm text-primary font-medium">
            <CheckCircle2 size={18} className="shrink-0" />
            <span className="flex-1">{uploadMessage || upgradeMessage}</span>
            <button
              onClick={clearMessages}
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
                      <p className="text-text-primary font-semibold text-sm">Upgrade to Tier 2</p>
                      <p className="text-text-subtle text-xs mt-0.5">{tierDescriptions[2]}</p>
                    </div>
                    <button
                      onClick={requestTierUpgrade}
                      disabled={isUpgrading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isUpgrading ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <ArrowUpRight size={15} />
                      )}
                      Upgrade
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-text-subtle text-sm text-center py-6">No KYC profile found.</p>
              )}
            </SectionCard>
          </div>

          {/* Risk Score Card */}
          <SectionCard title="Risk Score" icon={Gauge}>
            {risk ? (
              <div className="flex flex-col items-center">
                {/* SVG gauge */}
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
                      strokeDasharray={`${(riskGauge / 100) * 327} 327`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-text-primary">{risk.score}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${riskStyle[risk.level].bg} ${riskStyle[risk.level].text} ${riskStyle[risk.level].border}`}
                >
                  <AlertTriangle size={11} />
                  {risk.level}
                </span>

                <div className="mt-4 w-full space-y-1.5">
                  {risk.factors.map((f, i) => (
                    <p key={i} className="text-xs text-text-subtle flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-border flex-shrink-0" />
                      {f}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-text-subtle text-sm text-center py-4">No risk data.</p>
            )}
          </SectionCard>
        </div>

        {/* ── Limits + AML row ──────────────────────────────────────────── */}
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
                      ${limits.remainingDaily.toLocaleString()} / ${limits.dailySendLimit.toLocaleString()} USDT
                    </span>
                  </div>
                  <div className="h-2 bg-card-alt rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-[#00D6A3] to-[#0084FF] rounded-full transition-all"
                      style={{ width: `${(limits.remainingDaily / limits.dailySendLimit) * 100}%` }}
                    />
                  </div>
                </div>
                {/* Monthly */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-text-secondary font-medium">Monthly Limit</span>
                    <span className="text-text-primary font-bold">
                      ${limits.remainingMonthly.toLocaleString()} / ${limits.monthlySendLimit.toLocaleString()} USDT
                    </span>
                  </div>
                  <div className="h-2 bg-card-alt rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(limits.remainingMonthly / limits.monthlySendLimit) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-text-subtle text-xs">Higher tiers unlock higher send limits.</p>
              </div>
            ) : (
              <p className="text-text-subtle text-sm text-center py-4">No limit data.</p>
            )}
          </SectionCard>

          {/* AML Screening */}
          <SectionCard title="AML Screening" icon={Ban}>
            {aml ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm font-medium">Risk Level</span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${riskStyle[aml.riskLevel].bg} ${riskStyle[aml.riskLevel].text} ${riskStyle[aml.riskLevel].border}`}
                  >
                    <AlertTriangle size={11} />
                    {aml.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm font-medium">Flags</span>
                  <span className="text-text-primary font-bold text-sm">
                    {aml.flags.length === 0 ? "None" : aml.flags.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm font-medium">Last Checked</span>
                  <span className="text-text-primary text-sm font-medium">{formatDate(aml.createdAt)}</span>
                </div>

                {overview?.sanctionsHits && overview.sanctionsHits.length > 0 ? (
                  <div className="bg-danger-dim border border-danger/25 rounded-lg p-3">
                    <p className="text-xs font-bold text-danger flex items-center gap-1.5">
                      <Ban size={13} />
                      {overview.sanctionsHits.length} Sanctions Match(es) Found
                    </p>
                  </div>
                ) : (
                  <div className="bg-primary-dim border border-primary-border rounded-lg p-3">
                    <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      No sanctions matches found
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-text-subtle text-sm text-center py-4">No AML data.</p>
            )}
          </SectionCard>
        </div>

        {/* ── KYC Tier Status ──────────────────────────────────────────── */}
        <SectionCard
          title="KYC Tier Status"
          icon={Shield}
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
            <div className="space-y-5">
              {/* Tier Header */}
              <div className="flex items-center gap-4 p-4 bg-card-alt rounded-lg border border-border">
                <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-dim">
                  <Shield size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-text-primary font-semibold">
                    Tier {profile.tier}: {tierLabels[profile.tier]}
                  </p>
                  <p className="text-text-secondary text-xs mt-0.5">{tierDescriptions[profile.tier]}</p>
                  <p className="text-text-subtle text-xs mt-0.5">
                    Limit: ${limits?.monthlySendLimit?.toLocaleString() || "500"}/month
                  </p>
                </div>
              </div>

              {/* Profile Fields — Basic Identity (Tier 1) */}
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
                  <p className="text-text-primary font-semibold">{profile.country}</p>
                </div>
                <div>
                  <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Address</p>
                  <p className="text-text-primary font-semibold">{profile.address || "—"}</p>
                </div>
              </div>

              {/* Upgrade Button */}
              {profile.tier < 3 && (
                <button
                  onClick={requestTierUpgrade}
                  disabled={isUpgrading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isUpgrading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                  Upgrade to Tier {profile.tier + 1}: {tierLabels[profile.tier + 1]}
                </button>
              )}

              {profile.tier >= 3 && (
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

        {/* ── Compliance History ─────────────────────────────────────────── */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-text-primary font-semibold flex items-center gap-2">
              <Scale size={18} className="text-primary" />
              Compliance History
            </h2>
          </div>
          <div className="divide-y divide-border">
            {overview?.recentCases.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-card-alt transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg border ${
                      c.status === "RESOLVED"
                        ? "bg-primary-dim border-primary-border"
                        : c.status === "INVESTIGATING"
                        ? "bg-warning-dim border-warning/25"
                        : "bg-card-alt border-border"
                    }`}
                  >
                    <CheckCircle2
                      size={15}
                      className={
                        c.status === "RESOLVED"
                          ? "text-primary"
                          : c.status === "INVESTIGATING"
                          ? "text-warning"
                          : "text-text-subtle"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-semibold">{c.reason}</p>
                    <p className="text-text-subtle text-xs mt-0.5">
                      {c.assignedTo} · {formatDate(c.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                    c.status === "RESOLVED"
                      ? "bg-primary-dim text-primary border border-primary-border"
                      : c.status === "INVESTIGATING"
                      ? "bg-warning-dim text-warning border border-warning/25"
                      : "bg-card-alt text-text-subtle border border-border"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
            {(!overview?.recentCases || overview.recentCases.length === 0) && (
              <div className="p-8 text-center text-text-subtle text-sm">No compliance cases found.</div>
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
