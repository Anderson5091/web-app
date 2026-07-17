import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { transferApi } from "../../features/transfers/transfer.api";
import { walletApi } from "../../features/wallet/wallet.api";
import type { Transfer, TransferStatus } from "../../features/transfers/transfer.types";
import type { Transaction } from "../../features/wallet/wallet.types";
import {
  CheckCircle2,
  Shield,
  Landmark,
  RefreshCw,
  ArrowLeft,
  Loader2,
  XCircle,
  Send,
  CircleDot,
  ArrowRightLeft,
} from "lucide-react";
import GradientButton from "../../components/ui/GradientButton";
import { CURRENCY_TOKEN } from "../../config/constants";

/* ─── Status Steps ─── */
const STATUS_STEPS: {
  key: TransferStatus;
  label: string;
  desc: string;
  icon: typeof CheckCircle2;
}[] = [
  { key: "PENDING_PAYOUT", label: "Transfer Created", desc: "Your transfer has been submitted", icon: CheckCircle2 },
  { key: "COMPLIANCE_CHECK", label: "Compliance Review", desc: "AML and sanctions screening", icon: Shield },
  { key: "FUNDS_RESERVED", label: "Treasury", desc: "Funds allocated for transfer", icon: Landmark },
  { key: "SENT_TO_PARTNER", label: "Partner Processing", desc: "Sent to payout partner", icon: RefreshCw },
  { key: "DELIVERED", label: "Delivered", desc: "Funds delivered to beneficiary", icon: Send },
  { key: "COMPLETED", label: "Completed", desc: "Transfer finalized successfully", icon: CheckCircle2 },
];

function mapTransferStatus(status: TransferStatus): number {
  switch (status) {
    case "DRAFT":
    case "QUOTE_GENERATED":
      return -1;
    case "PENDING_PAYOUT":
      return 0;
    case "COMPLIANCE_CHECK":
      return 1;
    case "FUNDS_RESERVED":
      return 2;
    case "SENT_TO_PARTNER":
      return 3;
    case "DELIVERED":
      return 4;
    case "COMPLETED":
      return 5;
    case "FAILED":
      return -2;
    default:
      return 0;
  }
}

interface TransferDetail extends Transfer {
  beneficiary?: {
    fullName: string;
    country: string;
    payoutMethod: string;
    bankName?: string | null;
    accountNumber?: string | null;
  } | null;
  currency?: string;
}

/* ─── Instant Transfer Detail View ─── */
function InstantTransferDetail({ tx, onBack }: { tx: Transaction; onBack: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="max-w-xl mx-auto w-full px-4 py-6 space-y-5">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-medium mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary-dim flex items-center justify-center">
              <ArrowRightLeft size={20} className="text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Instant Transfer</h1>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1A2640] to-[#151B2B] rounded-xl p-5 border border-border">
          <p className="text-white text-[40px] font-bold leading-tight">
            {Number(tx.amount).toFixed(2)} <span className="text-lg font-medium text-white/60">{CURRENCY_TOKEN}</span>
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-dim text-success">
              <CircleDot size={10} />
              {tx.status}
            </span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-text-subtle text-[10px] font-semibold tracking-widest uppercase mb-3">
            Transfer Details
          </p>
          {[
            { label: "Reference", value: tx.transactionNumber || "—" },
            { label: "Beneficiary", value: tx.recipientName || tx.recipientEmail || "—" },
            { label: "Amount", value: `${Number(tx.amount).toFixed(2)} ${CURRENCY_TOKEN}` },
            { label: "Fee", value: `0 ${CURRENCY_TOKEN}` },
            { label: "Date", value: new Date(tx.createdAt).toLocaleDateString() },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center py-2 border-b border-border last:border-0"
            >
              <span className="text-text-secondary text-sm">{row.label}</span>
              <span className="text-text-primary text-sm font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="pb-6">
          <GradientButton title="Back to Dashboard" onPress={() => navigate("/home")} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Tracker ─── */
export default function TransferTracker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<TransferDetail | null>(null);
  const [walletTx, setWalletTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const res = await transferApi.getTransfer(id);
      setTransfer(res.data as TransferDetail);
    } catch {
      try {
        const res = await walletApi.getTransaction(id);
        setWalletTx(res.data);
      } catch {
        setError("Transfer not found");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh while transfer is in progress
  useEffect(() => {
    if (!transfer) return;
    const terminal: TransferStatus[] = ["COMPLETED", "DELIVERED", "FAILED"];
    if (terminal.includes(transfer.status)) return;
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [transfer?.status, loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-text-secondary font-medium">Loading transfer...</p>
        </div>
      </div>
    );
  }

  // Internal transfer — show minimal detail view
  if (walletTx) {
    return <InstantTransferDetail tx={walletTx} onBack={() => navigate("/wallet/transactions")} />;
  }

  if (error || !transfer) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center p-4">
        <div className="bg-card rounded-xl p-8 max-w-md w-full text-center border border-border">
          <XCircle size={48} className="text-text-subtle mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Transfer Not Found</h2>
          <p className="text-text-secondary text-sm mb-6">{error || "This transfer could not be located."}</p>
          <button
            onClick={() => navigate("/wallet/transactions")}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={16} /> Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = mapTransferStatus(transfer.status);
  const isFailed = transfer.status === "FAILED";
  const payoutMethod = transfer.beneficiary?.payoutMethod || transfer.payoutMethod || "";
  const methodLabel: Record<string, string> = {
    BANK: "Bank Transfer",
    MOBILE_MONEY: "Mobile Wallet",
    CASH_PICKUP: "Cash Pickup",
  };

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="max-w-xl mx-auto w-full px-4 py-6 space-y-5">
        <div>
          <button
            onClick={() => navigate("/wallet/transactions")}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-medium mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Track Transfer</h1>
        </div>

        <div className="bg-gradient-to-br from-[#1A2640] to-[#151B2B] rounded-xl p-5 border border-border">
          <p className="text-white/70 text-sm mb-1">
            To {transfer.beneficiary?.fullName || "Recipient"}
          </p>
          <p className="text-white text-[40px] font-bold leading-tight">
            {transfer.amount.toFixed(2)} <span className="text-lg font-medium text-white/60">{CURRENCY_TOKEN}</span>
          </p>
          {transfer.destinationAmount && transfer.currency && (
            <p className="text-white/60 text-sm mt-1">
              ≈ {transfer.currency} {Number(transfer.destinationAmount).toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </p>
          )}
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isFailed
                  ? "bg-danger-dim text-danger"
                  : transfer.status === "COMPLETED" || transfer.status === "DELIVERED"
                    ? "bg-success-dim text-success"
                    : "bg-primary-dim text-primary"
              }`}
            >
              <CircleDot size={10} />
              {transfer.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-text-primary text-lg font-semibold mb-3">Transfer Progress</h2>
          <div className="bg-card rounded-xl p-4 border border-border">
            {STATUS_STEPS.map((step, i) => {
              const isDone = currentStepIndex > i;
              const isActive = currentStepIndex === i;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center w-7">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 ${
                        isDone
                          ? "bg-primary border-primary"
                          : isActive
                            ? "bg-primary-dim border-primary"
                            : "bg-card-alt border-border"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={14} className="text-white" />
                      ) : isActive ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                      ) : null}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 min-h-[28px] my-0.5 transition-colors ${
                          isDone ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>

                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-1.5">
                      <StepIcon
                        size={14}
                        className={isDone || isActive ? "text-primary" : "text-text-subtle"}
                      />
                      <p
                        className={`text-sm font-medium ${
                          isDone || isActive ? "text-text-primary" : "text-text-subtle"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    <p className="text-text-subtle text-xs mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-text-subtle text-[10px] font-semibold tracking-widest uppercase mb-3">
            Transfer Details
          </p>
          {[
            { label: "Reference", value: transfer.referenceId || "—" },
            { label: "Beneficiary", value: transfer.beneficiary?.fullName || "—" },
            { label: "Country", value: transfer.beneficiary?.country || "—" },
            { label: "Payout Method", value: methodLabel[payoutMethod] || payoutMethod.replace(/_/g, " ") || "—" },
            { label: "Amount", value: `${transfer.amount.toFixed(2)} ${CURRENCY_TOKEN}` },
            { label: "Fee", value: transfer.fee != null ? `${Number(transfer.fee).toFixed(2)} ${CURRENCY_TOKEN}` : "—" },
            { label: "FX Rate", value: transfer.fxRate ? `1 ${CURRENCY_TOKEN} = ${Number(transfer.fxRate)} ${transfer.currency || "USD"}` : "—" },
            { label: "Recipient Gets", value: transfer.destinationAmount ? `${transfer.currency || "USD"} ${Number(transfer.destinationAmount).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center py-2 border-b border-border last:border-0"
            >
              <span className="text-text-secondary text-sm">{row.label}</span>
              <span className="text-text-primary text-sm font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>

        {isFailed && (
          <div className="bg-danger-dim border border-danger/30 rounded-xl p-4 text-center">
            <XCircle size={32} className="text-danger mx-auto mb-2" />
            <p className="text-danger font-bold mb-1">Transfer Failed</p>
            <p className="text-text-secondary text-sm">
              Please contact support or try creating a new transfer.
            </p>
          </div>
        )}

        {(transfer.status === "COMPLETED" || transfer.status === "DELIVERED") && (
          <div className="bg-success-dim border border-success/30 rounded-xl p-4 text-center">
            <CheckCircle2 size={32} className="text-success mx-auto mb-2" />
            <p className="text-success font-bold text-lg">Transfer Complete</p>
            <p className="text-text-secondary text-sm mt-1">
              Funds have been successfully delivered to {transfer.beneficiary?.fullName || "the recipient"}.
            </p>
          </div>
        )}

        <div className="space-y-3 pb-6">
          <GradientButton
            title="Back to Dashboard"
            onPress={() => navigate("/home")}
          />
        </div>
      </div>
    </div>
  );
}
