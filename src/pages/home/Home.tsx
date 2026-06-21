import { useAuthStore } from "../../features/auth/auth.store";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { useNotificationStore } from "../../features/notifications/notification.store";
import { useNavigate } from "react-router-dom";
import { Send, ArrowDownLeft, ArrowUpRight, History, Verified, ArrowRight, Bell } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const { wallet, transactions, fetchWallet, fetchTransactions } = useWalletStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    fetchUnreadCount();
  }, [fetchWallet, fetchTransactions, fetchUnreadCount]);

  const recent = transactions.slice(0, 10);
  const firstName = user?.fullName?.split(" ")[0] || "User";

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-primary-dim border border-primary-border flex items-center justify-center shrink-0">
              <span className="text-primary text-lg font-bold">{(user?.fullName?.[0] || user?.email?.[0] || "U").toUpperCase()}</span>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Good morning,</p>
              <h1 className="text-text-primary text-2xl font-bold">{firstName} 👋</h1>
            </div>
          </div>
          <button
            onClick={() => navigate("/notifications")}
            className="md:hidden relative w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors"
          >
            <Bell size={20} className="text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
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
            {(wallet?.cryptoWallets?.length ? wallet.cryptoWallets : [{ network: "BASE" }, { network: "ETHEREUM" }, { network: "SOLANA" }, { network: "POLYGON" }]).map((w) => (
              <span key={w.network} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-secondary text-[10px]">
                {w.network}
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

        {/* Transfer History */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-text-primary text-lg font-semibold">Transfer History</h3>
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
          recent.map((tx) => {
            const isDeposit = tx.type === "DEPOSIT";
            return (
              <div
                key={tx.id}
                onClick={() => {
                  if (isDeposit && tx.txHash) {
                    navigate(`/deposit/${tx.txHash}`);
                  } else if (tx.type === "WITHDRAWAL" && tx.txHash) {
                    navigate(`/withdrawal/${tx.txHash}`);
                  }
                }}
                className={`flex items-center gap-4 bg-card rounded-lg border border-border p-4 mb-2 transition-colors ${
                  tx.txHash ? "cursor-pointer hover:bg-card-alt" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                  isDeposit ? "bg-primary-dim" : tx.type === "WITHDRAWAL" ? "bg-danger-dim" : "bg-warning-dim"
                }`}>
                  {isDeposit ? (
                    <ArrowDownLeft size={20} className="text-primary" />
                  ) : tx.type === "WITHDRAWAL" ? (
                    <ArrowUpRight size={20} className="text-danger" />
                  ) : (
                    <Send size={20} className="text-warning" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-text-primary text-sm font-semibold capitalize">{tx.type.toLowerCase()}</p>
                  <p className="text-text-subtle text-xs mt-0.5">{new Date(tx.createdAt).toLocaleDateString()} · {tx.status}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isDeposit ? "text-primary" : "text-danger"}`}>
                    {isDeposit ? "+" : "-"}${tx.amount}
                  </p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full mt-1 ${
                    tx.status === "COMPLETED"
                      ? "bg-primary-dim text-primary"
                      : tx.status === "PENDING"
                      ? "bg-warning-dim text-warning"
                      : "bg-danger-dim text-danger"
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
