import { ChevronRight, Trash2 } from "lucide-react";

interface Beneficiary {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  payoutMethod: string;
  bankName?: string;
  accountNumber?: string;
  provider?: string;
  pickupLocation?: string;
}

interface BeneficiaryCardProps {
  beneficiary: Beneficiary;
  onPress?: () => void;
  onDelete?: () => void;
  selectable?: boolean;
  selected?: boolean;
}

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  mobile_wallet: "Mobile Wallet",
  cash_pickup: "Cash Pickup",
  agent_network: "Agent Network",
  door_delivery: "Door Delivery",
};

export default function BeneficiaryCard({ beneficiary, onPress, onDelete, selectable, selected }: BeneficiaryCardProps) {
  const initials = beneficiary.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <button
      onClick={onPress}
      className={`w-full flex items-center gap-4 bg-card rounded-lg border p-4 mb-2 transition-colors text-left ${
        selected ? "border-primary bg-primary-dim" : "border-border hover:bg-card-alt"
      }`}
    >
      <div className="w-[46px] h-[46px] rounded-full bg-secondary-dim flex items-center justify-center shrink-0">
        <span className="text-secondary text-base font-bold">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-semibold">{beneficiary.name}</p>
        <p className="text-text-secondary text-xs mt-0.5">{beneficiary.countryCode} · {METHOD_LABELS[beneficiary.payoutMethod]}</p>
        {beneficiary.bankName ? (
          <p className="text-text-subtle text-xs mt-0.5">{beneficiary.bankName}</p>
        ) : beneficiary.provider ? (
          <p className="text-text-subtle text-xs mt-0.5">{beneficiary.provider}</p>
        ) : beneficiary.pickupLocation ? (
          <p className="text-text-subtle text-xs mt-0.5">{beneficiary.pickupLocation}</p>
        ) : null}
      </div>
      <div className="shrink-0">
        {selectable ? (
          <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
            selected ? "border-primary" : "border-border"
          }`}>
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
        ) : onDelete ? (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-danger">
            <Trash2 size={20} />
          </button>
        ) : (
          <ChevronRight size={20} className="text-text-subtle" />
        )}
      </div>
    </button>
  );
}
