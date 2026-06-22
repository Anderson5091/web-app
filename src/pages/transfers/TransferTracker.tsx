import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { transferApi } from "../../features/transfers/transfer.api";
import type { Transfer } from "../../features/transfers/transfer.types";
import { ArrowLeft, Send, CheckCircle2, Loader } from "lucide-react";

export default function TransferTracker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    transferApi
      .getTransfer(id)
      .then((res) => setTransfer(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <Loader size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center gap-4 p-4">
        <Send size={40} className="text-text-subtle" />
        <h1 className="text-text-primary text-xl font-bold">Transfer Not Found</h1>
        <p className="text-text-secondary text-sm text-center">This transfer could not be found.</p>
        <button
          onClick={() => navigate("/wallet/transactions")}
          className="mt-4 px-4 py-2.5 rounded-md bg-primary text-white font-semibold text-sm"
        >
          Back to Transactions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => navigate("/wallet/transactions")}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Transactions</span>
        </button>

        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-dim flex items-center justify-center">
              <Send size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-text-primary text-xl font-bold">Transfer Details</h1>
              <p className="text-text-subtle text-sm">
                {transfer.createdAt ? new Date(transfer.createdAt).toLocaleDateString() : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 size={18} className="text-primary" />
            <span className="text-primary text-sm font-semibold">Completed</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-text-secondary text-sm">Reference</span>
              <span className="text-text-primary text-sm font-mono font-semibold">{transfer.referenceId}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-text-secondary text-sm">Amount</span>
              <span className="text-text-primary text-sm font-bold">${Number(transfer.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-text-secondary text-sm">Payout Method</span>
              <span className="text-text-primary text-sm font-medium capitalize">{transfer.payoutMethod?.replace("_", " ").toLowerCase()}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-text-secondary text-sm">Status</span>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary-dim text-primary">
                Completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
