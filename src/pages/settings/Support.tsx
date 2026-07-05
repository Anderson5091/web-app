import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MessageCircle, Mail, Phone, Users,
  ChevronDown, ChevronUp, Send, Info, Headphones
} from "lucide-react";

const FAQ_ITEMS = [
  { q: "How long does a transfer take?", a: "Bank transfers typically take 1–3 business days. Mobile wallet transfers are instant to 24 hours. Cash pickup is usually available within minutes of confirmation." },
  { q: "What is the minimum transfer amount?", a: "The minimum transfer amount is 10 USDT. This ensures fees are proportionate to the transfer value." },
  { q: "How do I increase my transaction limits?", a: "Complete higher KYC tiers to unlock larger limits. Tier 1 allows up to $500/month, Tier 2 up to $5,000/month, and Tier 3 is unlimited." },
  { q: "What happens if my transfer fails compliance?", a: "Your funds are automatically refunded to your wallet balance within 24 hours. You will receive a notification with the reason for rejection." },
  { q: "How do I deposit USDT into my wallet?", a: "Go to Wallet → Deposit Addresses and copy your address for the desired network. Send USDT to that address from any external wallet." },
  { q: "Are my funds insured?", a: "Quick Send holds all user funds in segregated wallets. We employ industry-standard security practices and multi-signature custody." },
];

const contactOptions = [
  { icon: Mail, label: "Email Support", sub: "support@quicksend.io", color: "#00D6A3", href: "mailto:support@quicksend.io" },
  { icon: MessageCircle, label: "Live Chat", sub: "Available 9am–6pm UTC", color: "#0084FF", to: "/settings/chat" },
  { icon: Phone, label: "Phone Support", sub: "+1 (800) 555-0199 — Pro users", color: "#F5A623" },
  { icon: Users, label: "Community Forum", sub: "Ask the community", color: "#A78BFA", href: "https://quicksend.io/community" },
];

export default function Support() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubject("");
    setMessage("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
            <h1 className="text-text-primary text-2xl font-bold">Help & Support</h1>
            <p className="text-text-secondary text-sm">We are here to help</p>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1A2640] to-[#151B2B] rounded-xl p-6 border border-border mb-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-dim border border-primary-border flex items-center justify-center mb-3">
            <Headphones size={28} className="text-primary" />
          </div>
          <h2 className="text-text-primary text-xl font-bold mb-1">How can we help?</h2>
          <p className="text-text-secondary text-sm mb-4">Average response time: under 2 hours</p>
          <div className="flex gap-6">
            {[
              { val: "98%", label: "Satisfaction" },
              { val: "< 2h", label: "Response" },
              { val: "24/7", label: "Coverage" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-primary text-xl font-bold">{s.val}</p>
                <p className="text-text-subtle text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Contact Us</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {(contactOptions as (typeof contactOptions[number] & { to?: string })[]).map((opt) => {
            const Tag = opt.to ? "button" : "a";
            const extraProps = opt.to
              ? { onClick: () => navigate(opt.to!) }
              : { href: opt.href || "#", onClick: (e: React.MouseEvent) => { if (!opt.href) e.preventDefault(); } };
            return (
              <Tag
                key={opt.label}
                {...extraProps}
                className="bg-card rounded-xl border border-border p-4 hover:bg-card-alt transition-colors text-left"
              >
                <div className="w-11 h-11 rounded-md flex items-center justify-center mb-2" style={{ backgroundColor: opt.color + "20" }}>
                  <opt.icon size={20} color={opt.color} />
                </div>
                <p className="text-text-primary text-sm font-semibold">{opt.label}</p>
                <p className="text-text-subtle text-[10px] mt-0.5 leading-tight">{opt.sub}</p>
              </Tag>
            );
          })}
        </div>

        {/* FAQ */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Frequently Asked Questions</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`${i < FAQ_ITEMS.length - 1 ? "border-b border-border" : ""}`}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-card-alt transition-colors"
              >
                <span className="text-text-primary text-sm font-medium flex-1 pr-2">{item.q}</span>
                {expandedFaq === i ? <ChevronUp size={18} className="text-text-secondary shrink-0" /> : <ChevronDown size={18} className="text-text-secondary shrink-0" />}
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-text-secondary text-sm leading-6">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Ticket */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Submit a Ticket</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
          <div className="p-4 space-y-4">
            <div>
              <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Subject</p>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full bg-card border border-border rounded-md px-3 h-[48px] text-text-primary text-sm outline-none focus:border-primary placeholder-text-subtle"
              />
            </div>
            <div>
              <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Message</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="w-full bg-card border border-border rounded-md px-3 py-3 text-text-primary text-sm outline-none focus:border-primary placeholder-text-subtle resize-none"
              />
            </div>
            <div className="flex items-start gap-2">
              <Info size={14} className="text-text-subtle shrink-0 mt-0.5" />
              <p className="text-text-subtle text-xs">Replies will be sent to your registered email address.</p>
            </div>
            <button
              onClick={handleSubmitTicket}
              disabled={submitting || !subject.trim() || !message.trim()}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <Send size={16} />
                  Submit Support Ticket
                </>
              )}
            </button>
            {submitted && (
              <p className="text-center text-primary text-sm font-semibold animate-pulse">Ticket submitted! We'll reply within 24 hours.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
