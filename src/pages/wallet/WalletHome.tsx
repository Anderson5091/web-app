import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { ArrowUpRight, ArrowLeftRight, ArrowDownLeft, History, Plus, ArrowDown, Send } from "lucide-react";
import Loader from "../../components/ui/Loader";

const QUICK_ACTIONS = [
  { label: "Add Funds", icon: ArrowDownLeft, route: "/wallet/deposit", color: "#0084FF" },
  { label: "Transfer", icon: ArrowLeftRight, route: "/wallet/p2p", color: "#00D6A3" },
  { label: "Withdraw", icon: ArrowUpRight, route: "/wallet/withdraw", color: "#F5A623" },
  { label: "History", icon: History, route: "/wallet/transactions", color: "#A78BFA" },
];

const TX_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string; color?: string; style?: React.CSSProperties }>; color: string }> = {
  welcome_deposit: { icon: Plus, color: "#00D6A3" },
  deposit: { icon: ArrowDown, color: "#00D6A3" },
  transfer_out: { icon: ArrowUpRight, color: "#FF4E4E" },
  transfer_in: { icon: ArrowDown, color: "#00D6A3" },
  fee: { icon: Plus, color: "#F5A623" },
};

export default function WalletHome() {
  const navigate = useNavigate();
  const { wallet, transactions, fetchWallet, fetchTransactions, isLoading } = useWalletStore();

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

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

        {/* Quick Actions */}
        <h3 className="text-text-primary text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => navigate(a.route)}
                className="flex flex-col items-center gap-2 bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-md flex items-center justify-center" style={{ backgroundColor: a.color + "20" }}>
                  <Icon size={24} color={a.color} />
                </div>
                <span className="text-text-secondary text-[10px] font-medium text-center">{a.label}</span>
              </button>
            );
          })}
        </div>

        {/* Transaction History */}
        <h3 className="text-text-primary text-lg font-semibold mb-4">Transaction History</h3>
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
