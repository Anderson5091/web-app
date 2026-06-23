import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WalletService } from "../../features/wallet/wallet.service";
import type { DepositStatus } from "../../features/wallet/wallet.types";
import { ArrowLeft, Loader, Check, Copy, ExternalLink, XCircle } from "lucide-react";

const REQUIRED_CONFIRMATIONS = 5;

const DEPOSIT_STEPS = ["WALLET_CREATED", "DETECTED", "APPROVED", "SWEPT", "COMPLETED"];

function getStepIndex(status: string): number {
  const idx = DEPOSIT_STEPS.indexOf(status);
  return idx >= 0 ? idx : -1;
}

export default function DepositTracker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [depositStatus, setDepositStatus] = useState<DepositStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!id) return;
    try {
      const status = await WalletService.getDepositStatus(id);
      if (status) {
        setDepositStatus(status);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <Loader size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!depositStatus) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center gap-4 p-4">
        <XCircle size={40} className="text-danger" />
        <h1 className="text-text-primary text-xl font-bold">Deposit Not Found</h1>
        <p className="text-text-secondary text-sm text-center">This deposit request could not be found or has expired.</p>
        <button onClick={() => navigate("/wallet/transactions")} className="mt-4 p-3 rounded-md bg-primary text-white font-semibold text-sm">
          Back to Transactions
        </button>
      </div>
    );
  }

  const stepIndex = getStepIndex(depositStatus.status);
  const isComplete = depositStatus.status === "COMPLETED";
  const isFailed = depositStatus.status === "FAILED";
  const conf = depositStatus.confirmations || 0;
  const progress = Math.min(conf / REQUIRED_CONFIRMATIONS, 1);

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate("/wallet/transactions")} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <div>
          <h1 className="text-text-primary text-xl font-bold">Deposit Details</h1>
          <p className="text-text-secondary text-sm">Track your deposit status</p>
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
              <Loader size={24} className={`text-warning ${stepIndex <= 0 ? "animate-spin" : ""}`} />
            )}
            <div>
              <p className={`text-base font-bold ${
                isComplete ? "text-primary" : isFailed ? "text-danger" : "text-warning"
              }`}>
                {isComplete ? "Deposit Complete" : isFailed ? "Deposit Failed" : "Deposit in Progress"}
              </p>
              <p className="text-text-secondary text-xs mt-0.5">
                Status: {depositStatus.status}
              </p>
            </div>
          </div>
        </div>

        {/* Step Timeline */}
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <p className="text-text-primary text-sm font-semibold mb-3">Progress</p>
          <div className="flex items-center justify-between">
            {DEPOSIT_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1">
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
                  {step === "WALLET_CREATED" ? "Created" : step === "DETECTED" ? "Detected" : step === "APPROVED" ? "Approved" : step === "SWEPT" ? "Swept" : "Complete"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Progress (when detected) */}
        {stepIndex >= 1 && !isComplete && !isFailed && (
          <div className="bg-card rounded-xl p-4 border border-border mb-4">
            <p className="text-text-primary text-sm font-semibold mb-3">Confirmations</p>
            <div className="flex items-center justify-center gap-2 mb-3">
              {Array.from({ length: REQUIRED_CONFIRMATIONS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < conf ? "bg-primary text-white" : "bg-card-alt text-text-subtle border border-border"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="w-full bg-card-alt rounded-full h-2 mb-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="text-text-secondary text-xs text-center">
              {conf} / {REQUIRED_CONFIRMATIONS} confirmations
            </p>
          </div>
        )}

        {/* Transaction Hash */}
        {depositStatus.txHash && (
          <div className="bg-card rounded-xl p-4 border border-border mb-4">
            <p className="text-text-secondary text-xs mb-2">Transaction Hash</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-text-primary text-xs font-mono truncate">{depositStatus.txHash}</p>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { navigator.clipboard.writeText(depositStatus.txHash!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="p-2 rounded-md bg-card-alt border border-border hover:border-text-subtle"
                >
                  {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} className="text-text-secondary" />}
                </button>
                <a
                  href={`https://${
                    depositStatus.network === "BASE" ? "basescan.org" :
                    depositStatus.network === "ETHEREUM" ? "etherscan.io" :
                    depositStatus.network === "POLYGON" ? "polygonscan.com" :
                    "solscan.io"
                  }/tx/${depositStatus.txHash}`}
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

        {/* Deposit Details */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-2">
          <p className="text-text-primary text-sm font-semibold mb-2">Details</p>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Amount</span>
            <span className="text-text-primary font-medium">{depositStatus.amount || "—"} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Fee</span>
            <span className="text-text-primary font-medium">{depositStatus.fee || "—"} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Net Received</span>
            <span className="text-primary font-bold">{depositStatus.netAmount || "—"} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Network</span>
            <span className="text-text-primary font-medium">{depositStatus.network}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Created</span>
            <span className="text-text-primary font-medium">{new Date(depositStatus.createdAt).toLocaleDateString()}</span>
          </div>
          {depositStatus.address && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Address</span>
              <span className="text-text-primary font-mono text-xs max-w-[180px] truncate">{depositStatus.address}</span>
            </div>
          )}
        </div>

        {isComplete && (
          <button onClick={() => navigate("/wallet")} className="w-full mt-4 p-3 rounded-md bg-primary text-white font-semibold text-sm">
            Back to Wallet
          </button>
        )}
      </div>
    </div>
  );
}
