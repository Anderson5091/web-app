import { useEffect, useState } from "react";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { ArrowUpRight, Send, Copy, Check, ArrowDown, Plus } from "lucide-react";
import Loader from "../../components/ui/Loader";

const MOCK_DEPOSIT_ADDRESSES = [
  { network: "TRON", symbol: "TRC-20", address: "TQn7zKG5dHN4PL8JKnCWHkA5QvRmM2uXz", icon: "T" },
  { network: "Ethereum", symbol: "ERC-20", address: "0x3f4d8c1a9B2e7f6D0cA4b8E3F1d2C5a6B7e8F9c", icon: "E" },
  { network: "Polygon", symbol: "MATIC", address: "0x7aB1cD3e8F2a4B6C9d0E1f3A5b7C8d9E0f1A2b3", icon: "P" },
  { network: "Solana", symbol: "SPL", address: "9xTzK3mRvL8nQpW2jB7cF4eH6iY1aU5oD0gN3kM", icon: "S" },
];

const TX_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string; color?: string; style?: React.CSSProperties }>; color: string }> = {
  welcome_deposit: { icon: Plus, color: "#00D6A3" },
  deposit: { icon: ArrowDown, color: "#00D6A3" },
  transfer_out: { icon: ArrowUpRight, color: "#FF4E4E" },
  transfer_in: { icon: ArrowDown, color: "#00D6A3" },
  fee: { icon: Plus, color: "#F5A623" },
};

export default function WalletHome() {
  const { wallet, transactions, fetchWallet, fetchTransactions, isLoading } = useWalletStore();
  const [copiedAddr, setCopiedAddr] = useState("");

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddr(address);
    setTimeout(() => setCopiedAddr(""), 2000);
  };

  if (isLoading && !wallet) {
    return <Loader size="lg" className="min-h-[50vh]" text="Loading wallet..." />;
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-text-primary text-2xl font-bold mb-6">Wallet</h1>

        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#00D6A3] to-[#0084FF] rounded-xl p-6 mb-6 min-h-[180px]">
          <div className="absolute w-[160px] h-[160px] rounded-full bg-white/8 top-[-40px] right-[-30px]" />
          <p className="text-white/75 text-sm">Total Balance</p>
          <h2 className="text-white text-[44px] font-bold mt-1">
            ${parseFloat(wallet?.availableBalance || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-white/70 text-base mb-4">USDT</p>
          <div className="flex items-center gap-6 bg-black/15 rounded-md p-4">
            <div>
              <p className="text-white/60 text-xs">Available</p>
              <p className="text-white text-base font-semibold mt-0.5">
                ${(parseFloat(wallet?.availableBalance || "0") - parseFloat(wallet?.pendingBalance || "0")).toFixed(2)}
              </p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-white/60 text-xs">Pending Out</p>
              <p className="text-white text-base font-semibold mt-0.5">${parseFloat(wallet?.pendingBalance || "0").toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Deposit Addresses */}
        <h3 className="text-text-primary text-lg font-semibold mb-1">Deposit Addresses</h3>
        <p className="text-text-secondary text-xs mb-4">Send USDT to any address below — funds reflect within minutes.</p>

        {MOCK_DEPOSIT_ADDRESSES.map((addr) => (
          <div key={addr.network} className="flex items-center justify-between bg-card rounded-lg p-4 border border-border mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center">
                <span className="text-primary text-lg font-bold">{addr.icon}</span>
              </div>
              <div>
                <p className="text-text-primary text-sm font-semibold">{addr.network}</p>
                <p className="text-text-subtle text-xs">{addr.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text-subtle text-xs font-mono">{addr.address.slice(0, 14)}...</p>
              <button
                onClick={() => copyAddress(addr.address)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded mt-1 text-xs ${
                  copiedAddr === addr.address ? "bg-primary-dim text-primary" : "bg-card-alt text-text-secondary"
                }`}
              >
                {copiedAddr === addr.address ? (
                  <><Check size={14} className="text-primary" /> Copied!</>
                ) : (
                  <><Copy size={14} /> Copy</>
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Transaction History */}
        <h3 className="text-text-primary text-lg font-semibold mt-6 mb-4">Transaction History</h3>
        <div className="bg-card rounded-lg border border-border p-4">
          {transactions.length === 0 ? (
            <p className="text-text-subtle text-sm text-center py-8">No transactions yet</p>
          ) : (
            transactions.map((tx) => {
              const cfg = TX_TYPE_CONFIG[tx.type] || { icon: Send, color: "#A0ABC0" };
              const Icon = cfg.icon;
              const isPos = parseFloat(tx.amount) > 0;
              const date = new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <div key={tx.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: cfg.color + "20" }}>
                    <Icon size={20} color={cfg.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary text-sm font-medium capitalize">{tx.type.toLowerCase()}</p>
                    <p className="text-text-subtle text-xs mt-0.5 capitalize">{date} · {tx.status}</p>
                  </div>
                  <p className={`text-sm font-bold ${isPos ? "text-primary" : "text-danger"}`}>
                    {isPos ? "+" : ""}{parseFloat(tx.amount).toFixed(2)} USDT
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
