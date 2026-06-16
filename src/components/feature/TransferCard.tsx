import { Banknote, Smartphone, Store, Package, Send } from "lucide-react";
import TransferStatusBadge from "./TransferStatusBadge";

interface Transfer {
  id: string;
  beneficiaryName: string;
  beneficiaryCountry: string;
  amount: number;
  currency: string;
  localAmount: number;
  localCurrency: string;
  fee: number;
  fxRate: number;
  status: string;
  payoutMethod: string;
  createdAt: string;
}

interface TransferCardProps {
  transfer: Transfer;
  onPress?: () => void;
}

const METHOD_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  bank_transfer: Banknote,
  mobile_wallet: Smartphone,
  cash_pickup: Store,
  agent_network: Package,
  door_delivery: Send,
};

export default function TransferCard({ transfer, onPress }: TransferCardProps) {
  const Icon = METHOD_ICONS[transfer.payoutMethod] || Send;
  const date = new Date(transfer.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-4 bg-card rounded-lg border border-border p-4 mb-2 hover:bg-card-alt transition-colors text-left"
    >
      <div className="w-11 h-11 rounded-md bg-primary-dim flex items-center justify-center shrink-0">
        <Icon size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-semibold truncate">{transfer.beneficiaryName}</p>
        <p className="text-text-subtle text-xs mt-0.5">{transfer.beneficiaryCountry} · {date}</p>
        <div className="mt-1.5">
          <TransferStatusBadge status={transfer.status} />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-danger text-sm font-bold">-{transfer.amount.toFixed(2)} USDT</p>
        <p className="text-text-subtle text-xs mt-0.5">≈ {transfer.localCurrency} {transfer.localAmount.toLocaleString()}</p>
      </div>
    </button>
  );
}
