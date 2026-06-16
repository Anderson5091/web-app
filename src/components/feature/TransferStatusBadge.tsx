import { Check, Clock, Shield, CircleDot, Ban, Send, Verified } from "lucide-react";

interface TransferStatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  draft: { label: "Draft", color: "#707B90", bg: "rgba(112,123,144,0.15)", icon: CircleDot },
  quote: { label: "Quote", color: "#707B90", bg: "rgba(112,123,144,0.15)", icon: CircleDot },
  created: { label: "Created", color: "#F5A623", bg: "rgba(245,166,35,0.15)", icon: Clock },
  compliance_review: { label: "Compliance", color: "#0084FF", bg: "rgba(0,132,255,0.15)", icon: Shield },
  treasury: { label: "Treasury", color: "#0084FF", bg: "rgba(0,132,255,0.15)", icon: Shield },
  partner_processing: { label: "Processing", color: "#0084FF", bg: "rgba(0,132,255,0.15)", icon: Send },
  delivered: { label: "Delivered", color: "#00D6A3", bg: "rgba(0,214,163,0.15)", icon: Check },
  completed: { label: "Completed", color: "#00D6A3", bg: "rgba(0,214,163,0.15)", icon: Verified },
  failed: { label: "Failed", color: "#FF4E4E", bg: "rgba(255,78,78,0.15)", icon: Ban },
};

export default function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.failed;
  const Icon = cfg.icon;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}
