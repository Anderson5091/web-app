import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WalletService } from "../../features/wallet/wallet.service";
import type { WithdrawalDetail } from "../../features/wallet/wallet.types";
import { ArrowLeft, Clock, Loader, Check, Copy, ExternalLink, XCircle, ArrowUpRight } from "lucide-react";

const WITHDRAWAL_STEPS = ["PENDING", "SENT", "COMPLETED"];

const explorerUrl = (chain: string, txHash: string) => {
  const base =
    chain === "BASE" ? "https://basescan.org/tx/" :
    chain === "ETHEREUM" ? "https://etherscan.io/tx/" :
    chain === "POLYGON" ? "https://polygonscan.com/tx/" :
    "https://solscan.io/tx/";
  return `${base}${txHash}`;
};

export default function WithdrawalTracker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [withdrawal, setWithdrawal] = useState<WithdrawalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchWithdrawal = useCallback(async () => {
    if (!id) return;
    try {
      const data = await WalletService.getWithdrawal(id);
      setWithdrawal(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWithdrawal();
    const interval = setInterval(fetchWithdrawal, 3000);
    return () => clearInterval(interval);
  }, [fetchWithdrawal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <Loader size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!withdrawal) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center gap-4 p-4">
        <XCircle size={40} className="text-danger" />
        <h1 className="text-text-primary text-xl font-bold">Withdrawal Not Found</h1>
        <p className="text-text-secondary text-sm text-center">This withdrawal request could not be found.</p>
        <button onClick={() => navigate("/wallet/transactions")} className="mt-4 p-3 rounded-md bg-primary text-white font-semibold text-sm">
          Back to Transactions
        </button>
      </div>
    );
  }

  const isComplete = withdrawal.status === "SENT" || withdrawal.status === "COMPLETED";
  const isFailed = withdrawal.status === "FAILED";
  const stepIndex = WITHDRAWAL_STEPS.indexOf(
    isComplete ? "COMPLETED" : withdrawal.status
  );

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate("/wallet/transactions")} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <div>
          <h1 className="text-text-primary text-xl font-bold">Withdrawal Details</h1>
          <p className="text-text-secondary text-sm">Track your withdrawal status</p>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 border mb-4 ${
          isComplete
            ? "bg-primary-dim border-primary-border"
            : isFailed
            ? "bg-danger-dim border-danger/30"
            : "bg-warning-dim border-warning/30"
        }`}>
          <div className="flex items-center gap-3">
            {isComplete ? (
              <Check size={24} className="text-primary" />
            ) : isFailed ? (
              <XCircle size={24} className="text-danger" />
            ) : (
              <Loader size={24} className="text-warning animate-spin" />
            )}
            <div>
              <p className={`text-base font-bold ${
                isComplete ? "text-primary" : isFailed ? "text-danger" : "text-warning"
              }`}>
                {isComplete ? "Withdrawal Complete" : isFailed ? "Withdrawal Failed" : "Withdrawal in Progress"}
              </p>
              <p className="text-text-secondary text-xs mt-0.5">
                Status: {withdrawal.status}
              </p>
            </div>
          </div>
        </div>

        {/* Step Timeline */}
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <p className="text-text-primary text-sm font-semibold mb-3">Progress</p>
          <div className="flex items-center justify-between">
            {["Pending", "Sent", "Complete"].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= stepIndex
                    ? "bg-primary text-white"
                    : "bg-card-alt text-text-subtle border border-border"
                }`}>
                  {i <= stepIndex ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] text-center leading-tight ${
                  i <= stepIndex ? "text-primary" : "text-text-subtle"
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Hash (when sent) */}
        {withdrawal.txHash && (
          <div className="bg-card rounded-xl p-4 border border-border mb-4">
            <p className="text-text-secondary text-xs mb-2">Transaction Hash</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-text-primary text-xs font-mono truncate">{withdrawal.txHash}</p>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { navigator.clipboard.writeText(withdrawal.txHash!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="p-2 rounded-md bg-card-alt border border-border hover:border-text-subtle"
                >
                  {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} className="text-text-secondary" />}
                </button>
                <a
                  href={explorerUrl(withdrawal.chain, withdrawal.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-card-alt border border-border hover:border-text-subtle flex items-center"
                >
                  <ExternalLink size={14} className="text-text-secondary" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Details */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-2">
          <p className="text-text-primary text-sm font-semibold mb-2">Details</p>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Amount</span>
            <span className="text-text-primary font-medium">{withdrawal.amount} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Fee</span>
            <span className="text-text-primary font-medium">{withdrawal.fee} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Net Sent</span>
            <span className="text-danger font-bold">{withdrawal.netAmount} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Network</span>
            <span className="text-text-primary font-medium">{withdrawal.chain}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Destination</span>
            <span className="text-text-primary font-mono text-xs max-w-[180px] truncate">{withdrawal.destinationAddress}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Created</span>
            <span className="text-text-primary font-medium">{new Date(withdrawal.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {isFailed && (
          <div className="mt-4 p-4 rounded-xl bg-danger-dim border border-danger/30">
            <p className="text-danger text-sm font-medium flex items-center gap-2">
              <XCircle size={16} />
              Withdrawal failed. The amount has been returned to your balance.
            </p>
          </div>
        )}

        {isComplete && (
          <button onClick={() => navigate("/wallet")} className="w-full mt-4 p-3 rounded-md bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2">
            <ArrowUpRight size={16} />
            Back to Wallet
          </button>
        )}
      </div>
    </div>
  );
}
