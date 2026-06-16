import { useAuthStore } from "../../features/auth/auth.store";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { useNavigate } from "react-router-dom";
import { Send, ArrowDownLeft, ArrowUpRight, History, Verified, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const { wallet, transactions, fetchWallet, fetchTransactions } = useWalletStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [fetchWallet, fetchTransactions]);

  const recent = transactions.slice(0, 3);
  const firstName = user?.name?.split(" ")[0] || "User";

  const quickActions = [
    { icon: ArrowDownLeft, label: "Add Funds",  onPress: () => navigate("/wallet/deposit"),      color: "#0084FF" },
    { icon: ArrowUpRight,  label: "Withdraw",   onPress: () => navigate("/wallet/withdraw"),     color: "#F5A623" },
    { icon: History,       label: "History",    onPress: () => navigate("/wallet/transactions"), color: "#A78BFA" },
    { icon: Verified,      label: "KYC / ID",   onPress: () => navigate("/compliance/kyc"),      color: "#00D6A3" },
  ];

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-11 h-11 rounded-full bg-primary-dim border border-primary-border flex items-center justify-center shrink-0">
            <span className="text-primary text-lg font-bold">{firstName[0]}</span>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Good morning,</p>
            <h1 className="text-text-primary text-2xl font-bold">{firstName} 👋</h1>
          </div>
        </div>

        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2640] to-[#151B2B] rounded-xl p-6 border border-border mb-6 min-h-[200px]">
          <div className="absolute w-[200px] h-[200px] rounded-full bg-primary/5 top-[-60px] right-[-40px]" />
          
          <div className="inline-flex items-center gap-1 bg-primary-dim px-2.5 py-1 rounded-full border border-primary-border mb-4">
            <Verified size={13} className="text-primary" />
            <span className="text-primary text-xs font-semibold">KYC Tier {user?.kycTier || 0}</span>
          </div>

          <p className="text-text-secondary text-sm mb-1">Available Balance</p>
          <h2 className="text-text-primary text-[42px] font-bold tabular-nums">
            ${(wallet?.availableBalance ?? "0.00")}
          </h2>
          <p className="text-text-secondary text-base mt-0.5 mb-2">USDT</p>

          {wallet && parseFloat(wallet.pendingBalance) > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <History size={13} className="text-warning" />
              <span className="text-warning text-xs">${parseFloat(wallet.pendingBalance).toFixed(2)} USDT pending</span>
            </div>
          )}

          <div className="flex gap-2 flex-wrap mt-2">
            {["TRC-20", "ERC-20", "SOL", "MATIC"].map((n) => (
              <span key={n} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-secondary text-[10px]">
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Send Hero CTA — primary action above secondary grid */}
        <button
          onClick={() => navigate("/wallet/transfer")}
          className="w-full bg-gradient-to-r from-[#00D6A3] to-[#0084FF] rounded-xl p-5 flex items-center justify-between mb-4 hover:opacity-90 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Send size={22} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white text-lg font-bold leading-tight">Send Money Now</h3>
              <p className="text-white/75 text-sm mt-0.5">Low fees · Real-time tracking</p>
            </div>
          </div>
          <ArrowRight size={22} className="text-white/80" />
        </button>

        {/* Quick Actions */}
        <h3 className="text-text-primary text-base font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={a.onPress}
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

        {/* Recent Transfers */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-text-primary text-lg font-semibold">Recent Transfers</h3>
          <button onClick={() => navigate("/wallet/transactions")} className="text-primary text-sm font-medium">
            See All
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center py-12 bg-card rounded-xl border border-border">
            <Send size={40} className="text-text-subtle" />
            <p className="text-text-secondary text-base font-semibold mt-3">No transfers yet</p>
            <p className="text-text-subtle text-sm mt-1">Start sending money to see your history here</p>
          </div>
        ) : (
          recent.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 bg-card rounded-lg border border-border p-4 mb-2">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                tx.type === "DEPOSIT" ? "bg-primary-dim" : "bg-danger-dim"
              }`}>
                {tx.type === "DEPOSIT" ? (
                  <ArrowDownLeft size={20} className="text-primary" />
                ) : (
                  <Send size={20} className="text-danger" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-text-primary text-sm font-semibold capitalize">{tx.type.toLowerCase()}</p>
                <p className="text-text-subtle text-xs mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${tx.type === "DEPOSIT" ? "text-primary" : "text-danger"}`}>
                  {tx.type === "DEPOSIT" ? "+" : "-"}${tx.amount}
                </p>
                <p className="text-text-subtle text-[10px] uppercase font-semibold mt-0.5">{tx.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
