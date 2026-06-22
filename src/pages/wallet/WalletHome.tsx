import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { ArrowUpRight, ArrowLeftRight, ArrowDownLeft, History, Send } from "lucide-react";
import Loader from "../../components/ui/Loader";

const QUICK_ACTIONS = [
  { label: "Add Funds", icon: ArrowDownLeft, route: "/wallet/deposit", color: "#0084FF" },
  { label: "Transfer", icon: ArrowLeftRight, route: "/wallet/p2p", color: "#00D6A3" },
  { label: "Withdraw", icon: ArrowUpRight, route: "/wallet/withdraw", color: "#F5A623" },
  { label: "History", icon: History, route: "/wallet/transactions", color: "#A78BFA" },
];

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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-text-primary text-lg font-semibold">Transaction History</h3>
          <button onClick={() => navigate("/wallet/transactions")} className="text-primary text-sm font-medium">
            See All
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 bg-card rounded-xl border border-border">
            <Send size={40} className="text-text-subtle" />
            <p className="text-text-secondary text-base font-semibold mt-3">No transactions yet</p>
            <p className="text-text-subtle text-sm mt-1">Your activity will appear here</p>
          </div>
        ) : (
          transactions.slice(0, 5).map((tx) => {
            const isDeposit = tx.type === "DEPOSIT";
            return (
              <div
                key={tx.id}
                onClick={() => {
                  if (isDeposit) {
                    navigate(`/deposit/${tx.txHash || tx.id}`);
                  } else if (tx.type === "WITHDRAWAL") {
                    navigate(`/withdrawal/${tx.txHash || tx.id}`);
                  } else if (tx.type === "TRANSFER") {
                    navigate(`/transfer/${tx.id}`);
                  }
                }}
                className="bg-card rounded-lg border border-border p-4 mb-2 transition-colors cursor-pointer hover:bg-card-alt"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
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
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold truncate">
                      {tx.type === "TRANSFER" ? "Transfer" : tx.type.toLowerCase()}
                      {tx.transactionNumber ? <span className="text-text-subtle text-xs ml-1 font-mono">#{tx.transactionNumber}</span> : null}
                    </p>
                    <p className="text-text-subtle text-xs mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isDeposit ? "text-primary" : "text-danger"}`}>
                      {isDeposit ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                    </p>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full mt-1 ${
                      tx.status === "COMPLETED"
                        ? "bg-primary-dim text-primary"
                        : tx.status === "PENDING"
                        ? "bg-warning-dim text-warning"
                        : "bg-danger-dim text-danger"
                    }`}>
                      {tx.status === "PENDING" && tx.type === "TRANSFER" ? "Pending (waiting for payout)" : tx.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
