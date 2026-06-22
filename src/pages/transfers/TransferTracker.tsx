import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { transferApi } from "../../features/transfers/transfer.api";
import type { Transfer } from "../../features/transfers/transfer.types";
import { ArrowLeft, Check, CheckCircle2, Loader, Send } from "lucide-react";
import GradientButton from "../../components/ui/GradientButton";

const STATUS_STEPS = [
  { key: "created", label: "Transfer Created" },
  { key: "compliance_review", label: "Compliance Review" },
  { key: "treasury", label: "Treasury" },
  { key: "partner_processing", label: "Partner Processing" },
  { key: "delivered", label: "Delivered" },
];

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

        <div className="flex flex-col items-center py-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center mb-6">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h2 className="text-text-primary text-3xl font-bold mb-2">Transfer Submitted!</h2>
          <p className="text-primary text-base font-semibold mb-3">
            ${Number(transfer.amount).toFixed(2)} USDT
          </p>
          <p className="text-text-secondary text-sm text-center leading-6 mb-8 max-w-sm">
            Your transfer is now undergoing compliance review. You can track the status in real time.
          </p>

          <div className="flex items-start gap-0 mb-8">
            {STATUS_STEPS.map((s, i) => (
              <div key={s.key} className="flex flex-col items-center w-14">
                <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 bg-primary border-primary">
                  <Check size={12} className="text-white" />
                </div>
                {i < 4 && <div className="w-14 h-0.5 bg-primary mt-[11px] -ml-0" />}
                <p className="text-[9px] text-center mt-1 text-primary">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="w-full space-y-3">
            <GradientButton title="View Transactions" onPress={() => navigate("/wallet/transactions")} />
            <GradientButton title="Back to Dashboard" variant="outline" onPress={() => navigate("/home")} />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 mt-4">
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
