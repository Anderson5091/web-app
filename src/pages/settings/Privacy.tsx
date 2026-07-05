import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Search, Share2, History, Gavel,
  Cookie, Download, Edit, Trash2, Mail, Info, ChevronDown, ChevronUp
} from "lucide-react";

const LAST_UPDATED = "January 15, 2025";

const SECTIONS = [
  { title: "1. Information We Collect", icon: Search, color: "#00D6A3", content: "We collect information you provide directly, including your name, email address, date of birth, and government-issued identification for KYC compliance.\n\nWe also collect transactional data including transfer amounts, beneficiary details, and timestamps for regulatory purposes. Device information and usage patterns are collected to improve security and prevent fraud." },
  { title: "2. How We Use Your Data", icon: Share2, color: "#0084FF", content: "Your data is used to:\n• Process and verify your identity (KYC/AML compliance)\n• Execute and track money transfers\n• Detect and prevent fraudulent activity\n• Comply with applicable financial regulations\n• Improve our services and user experience\n\nWe do not sell your personal data to third parties." },
  { title: "3. Data Sharing", icon: History, color: "#F5A623", content: "We may share your information with:\n• Regulatory authorities as required by law (FINCEN, OFAC, local regulators)\n• Payment partners and correspondent banks for transfer execution\n• Identity verification providers (KYC/AML service partners)\n• Fraud prevention and security service providers\n\nAll third-party partners are bound by data processing agreements compliant with applicable privacy laws." },
  { title: "4. Data Retention", icon: Gavel, color: "#A78BFA", content: "Transaction records are retained for a minimum of 5 years as required by anti-money laundering regulations. KYC documentation is retained for 5 years after account closure.\n\nAccount data is retained for the duration of your account and for 7 years after closure to meet legal obligations." },
  { title: "5. Your Rights", icon: Shield, color: "#00D6A3", content: "Depending on your jurisdiction, you may have the right to:\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion (subject to legal retention requirements)\n• Port your data to another service\n• Lodge a complaint with your local data protection authority\n\nContact privacy@quicksend.io to exercise any of these rights." },
  { title: "6. Security Measures", icon: History, color: "#00D6A3", content: "We employ industry-standard security including:\n• AES-256 encryption for data at rest\n• TLS 1.3 for data in transit\n• Multi-signature custody for digital assets\n• Regular third-party security audits\n\nDespite these measures, no system is completely secure. Please use strong passwords and enable MFA." },
  { title: "7. Cookies & Tracking", icon: Cookie, color: "#F5A623", content: "The app uses device identifiers and analytics tools to understand usage patterns and improve performance. We use:\n• Essential identifiers (required for app function)\n• Analytics (usage patterns — anonymized)\n• Security tokens (fraud prevention)\n\nYou can manage your analytics preferences below." },
];

export default function Privacy() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [analytics, setAnalytics] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/settings")} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Privacy Policy</h1>
            <p className="text-text-secondary text-sm">Last updated {LAST_UPDATED}</p>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-gradient-to-br from-[#1A2640] to-[#151B2B] rounded-xl p-5 border border-border mb-4 flex items-center gap-4">
          <div className="w-13 h-13 rounded-lg bg-primary-dim flex items-center justify-center shrink-0">
            <Shield size={26} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-text-primary text-base font-bold">Quick Send Privacy Policy</p>
            <p className="text-text-secondary text-xs mt-0.5">Effective {LAST_UPDATED}</p>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-primary-dim border border-primary-border">
            <span className="text-primary text-[10px] font-bold">GDPR</span>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <p className="text-text-secondary text-sm leading-6">
            Quick Send ("we", "us", or "our") is committed to protecting your personal data. This policy explains how we collect, use, and protect your information when you use our remittance platform.
          </p>
        </div>

        {/* Policy Sections */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Policy Sections</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
          {SECTIONS.map((sec, i) => (
            <div key={i} className={`${i < SECTIONS.length - 1 ? "border-b border-border" : ""}`}>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-card-alt transition-colors"
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: sec.color + "20" }}>
                  <sec.icon size={14} color={sec.color} />
                </div>
                <span className="flex-1 text-text-primary text-sm font-medium">{sec.title}</span>
                {expanded === i ? <ChevronUp size={18} className="text-text-secondary shrink-0" /> : <ChevronDown size={18} className="text-text-secondary shrink-0" />}
              </button>
              {expanded === i && (
                <div className="px-4 pb-4">
                  <p className="text-text-secondary text-sm leading-6 whitespace-pre-line">{sec.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Privacy Preferences */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Your Privacy Preferences</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
          {[
            { icon: Search, label: "Usage Analytics", sub: "Help improve the app with anonymized usage data", color: "#0084FF", value: analytics, onChange: setAnalytics },
            { icon: Shield, label: "Crash Reports", sub: "Automatically send crash logs to our team", color: "#F5A623", value: crashReports, onChange: setCrashReports },
            { icon: Mail, label: "Marketing Communications", sub: "Receive product updates and offers by email", color: "#A78BFA", value: marketing, onChange: setMarketing },
          ].map((pref, i) => (
            <div key={pref.label} className={`flex items-center gap-3 p-4 ${i < 2 ? "border-b border-border" : ""}`}>
              <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: pref.color + "20" }}>
                <pref.icon size={18} color={pref.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium">{pref.label}</p>
                <p className="text-text-subtle text-xs mt-0.5">{pref.sub}</p>
              </div>
              <button
                onClick={() => pref.onChange(!pref.value)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${pref.value ? "bg-primary" : "bg-border"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${pref.value ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Data Rights */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Your Data Rights</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { icon: Download, label: "Export Data", sub: "Download your data" },
            { icon: Edit, label: "Correct Data", sub: "Fix inaccuracies" },
            { icon: Trash2, label: "Delete Data", sub: "Request deletion" },
            { icon: Mail, label: "Contact DPO", sub: "privacy@quicksend.io" },
          ].map((r) => (
            <button key={r.label} className="bg-card rounded-xl border border-border p-4 text-left hover:bg-card-alt transition-colors">
              <div className="w-10 h-10 rounded-md bg-primary-dim flex items-center justify-center mb-2">
                <r.icon size={18} className="text-primary" />
              </div>
              <p className="text-text-primary text-sm font-semibold">{r.label}</p>
              <p className="text-text-subtle text-[10px] mt-0.5">{r.sub}</p>
            </button>
          ))}
        </div>

        {/* Contact */}
        <div className="flex items-start gap-2 bg-card rounded-lg p-4 border border-border">
          <Info size={16} className="text-text-subtle shrink-0 mt-0.5" />
          <p className="text-text-secondary text-xs leading-5">
            Questions? Contact our Data Protection Officer at <span className="text-primary">privacy@quicksend.io</span>
          </p>
        </div>
      </div>
    </div>
  );
}
