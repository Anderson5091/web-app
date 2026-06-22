import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { ArrowDownLeft, ArrowUpRight, Send } from "lucide-react";
import Loader from "../../components/ui/Loader";

type FilterTab = "all" | "pending" | "completed" | "failed";

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

export default function Transactions() {
  const { transactions, fetchTransactions, isLoading } = useWalletStore();
  const [filter, setFilter] = useState<FilterTab>("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "pending") return tx.status === "PENDING" || tx.status === "DETECTED";
    if (filter === "completed") return tx.status === "COMPLETED";
    if (filter === "failed") return tx.status === "FAILED";
    return true;
  });

  if (isLoading && transactions.length === 0) {
    return <Loader size="lg" className="min-h-[50vh]" text="Loading transactions..." />;
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Transfer History</h1>
            <p className="text-text-subtle text-sm">{transactions.length} total</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                filter === f.key
                  ? "bg-primary-dim border-primary-border text-primary"
                  : "bg-card border-border text-text-secondary hover:border-text-subtle"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <svg className="w-12 h-12 text-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-text-secondary text-lg font-semibold">No transfers found</p>
            <p className="text-text-subtle text-sm text-center">
              {filter === "all" ? "Your transfer history will appear here" : `No ${filter} transfers`}
            </p>
          </div>
        ) : (
          filtered.map((tx) => {
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
                className="flex items-center gap-4 bg-card rounded-lg border border-border p-4 mb-2 transition-colors cursor-pointer hover:bg-card-alt"
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
                  <p className="text-text-primary text-sm font-semibold capitalize">
                    {tx.type === "TRANSFER" ? "Transfer" : tx.type.toLowerCase()}
                    {tx.transactionNumber ? <span className="text-text-subtle text-xs ml-2 font-mono">#{tx.transactionNumber}</span> : null}
                  </p>
                  <p className="text-text-subtle text-xs mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isDeposit ? "text-primary" : "text-danger"}`}>
                    {isDeposit ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                  </p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full mt-1 ${
                    tx.status === "COMPLETED"
                      ? "bg-primary-dim text-primary"
                      : tx.status === "PENDING" && tx.type === "TRANSFER"
                      ? "bg-warning-dim text-warning"
                      : tx.status === "PENDING"
                      ? "bg-warning-dim text-warning"
                      : "bg-danger-dim text-danger"
                  }`}>
                    {tx.status === "PENDING" && tx.type === "TRANSFER" ? "Pending (waiting for payout)" : tx.status}
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
