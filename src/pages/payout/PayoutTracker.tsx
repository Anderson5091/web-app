import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePayoutStore } from "../../features/payout/payout.store";
import type { PayoutOrder, PayoutStatus } from "../../features/payout/payout.types";
import GradientButton from "../../components/ui/GradientButton";
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
} from "lucide-react";

/* ─── Payout Status Steps ─── */
const PAYOUT_STATUS_STEPS: {
  key: PayoutStatus;
  label: string;
  desc: string;
  icon: typeof CheckCircle2;
}[] = [
  { key: "PENDING", label: "Pending", desc: "Payout initiated", icon: CheckCircle2 },
  { key: "QUEUED", label: "Queued", desc: "Waiting for processing", icon: Loader2 },
  { key: "PROCESSING", label: "Processing", desc: "Being processed by partner", icon: Loader2 },
  { key: "SENT_TO_PARTNER", label: "Sent to Partner", desc: "Sent to payout partner", icon: Send },
  { key: "CONFIRMED", label: "Confirmed", desc: "Confirmed by partner", icon: CheckCircle2 },
  { key: "DELIVERED", label: "Delivered", desc: "Funds delivered to recipient", icon: Send },
];

const STATUS_ORDER: PayoutStatus[] = PAYOUT_STATUS_STEPS.map((s) => s.key);

function mapPayoutStatus(status: PayoutStatus): number {
  // Map the actual backend status to the appropriate step index
  switch (status) {
    case "PENDING":
      return 0;
    case "QUEUED":
      return 1;
    case "PROCESSING":
      return 2;
    case "SENT_TO_PARTNER":
      return 3;
    case "CONFIRMED":
      return 4;
    case "DELIVERED":
      return 5;
    case "FAILED":
      return -2; // before start
    default:
      return 0;
  }
}

export default function PayoutTracker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPayout, getPayoutStatus, retryPayout, listenForUpdates, isLoading, error } = usePayoutStore();

  // Fetch payout status when ID changes
  useEffect(() => {
    if (id) {
      getPayoutStatus(id);
    }
  }, [id, getPayoutStatus]);

  // Set up real-time updates listener
  useEffect(() => {
    if (currentPayout?.id) {
      const cleanup = listenForUpdates(currentPayout.id);
      return cleanup;
    }
  }, [currentPayout?.id, listenForUpdates]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-text-secondary font-medium">Loading payout...</p>
        </div>
      </div>
    );
  }

  if (!currentPayout) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center p-4">
        <div className="bg-card rounded-xl p-8 max-w-md w-full text-center border border-border">
          <XCircle size={48} className="text-text-subtle mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Payout Not Found
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            {error || "This payout could not be located."}
          </p>
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

  const payout = currentPayout;
  const currentStepIndex = mapPayoutStatus(payout.status);
  const isFailed = payout.status === "FAILED";
  const isDelivered = payout.status === "DELIVERED";

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="max-w-xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/wallet/transactions")}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-medium mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Payout Status
          </h1>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-[#1A2640] to-[#151B2B] rounded-xl p-5 border border-border">
          <p className="text-white/70 text-sm mb-1">
            To {payout.partner || "Partner"}
          </p>
          <p className="text-white text-[40px] font-bold leading-tight">
            {payout.transferId?.slice(0, 8)}...{payout.transferId?.slice(-4)}
          </p>
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isFailed
                  ? "bg-danger-dim text-danger"
                  : isDelivered
                    ? "bg-success-dim text-success"
                    : "bg-primary-dim text-primary"
              }`}
            >
              <CircleDot size={10} />
              {payout.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Payout Progress */}
        <div>
          <h2 className="text-text-primary text-lg font-semibold mb-3">
            Payout Progress
          </h2>
          <div className="bg-card rounded-xl p-4 border border-border">
            {PAYOUT_STATUS_STEPS.map((step, i) => {
              const isDone = currentStepIndex > i;
              const isActive = currentStepIndex === i;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex gap-3">
                  {/* Dot + line */}
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
                    {i < PAYOUT_STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 min-h-[28px] my-0.5 transition-colors ${
                          isDone ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>

                  {/* Step info */}
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

        {/* Payout Details */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-text-subtle text-[10px] font-semibold tracking-widest uppercase mb-3">
            Payout Details
          </p>
          {[
            { label: "Payout ID", value: payout.id },
            { label: "Transfer ID", value: payout.transferId || "—" },
            { label: "Partner", value: payout.partner || "—" },
            { label: "Payout Method", value: payout.payoutMethod.replace(/_/g, " ") || "—" },
            { label: "Attempts", value: `${payout.attemptCount} / 3` },
            { label: "External Reference", value: payout.externalReference || "—" },
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

        {/* Failed State */}
        {isFailed && (
          <div className="bg-danger-dim border border-danger/30 rounded-xl p-4 text-center">
            <XCircle size={32} className="text-danger mx-auto mb-2" />
            <p className="text-danger font-bold mb-1">Payout Failed</p>
            <p className="text-text-secondary text-sm">
              The payout could not be completed. You can retry it below.
            </p>
            <button
              onClick={async () => {
                await retryPayout(payout.id);
              }}
              disabled={isLoading || payout.attemptCount >= 3}
              className="w-full bg-danger-dim hover:bg-danger/20 text-danger rounded-xl p-4 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : payout.attemptCount >= 3 ? (
                "Max Retries Reached"
              ) : (
                <RefreshCw size={20} />
              )}
              {payout.attemptCount >= 3
                ? "Max Retries Reached"
                : `Retry Payout (Attempt ${payout.attemptCount + 1}/3)`}
            </button>
          </div>
        )}

        {/* Delivered Success Actions */}
        {isDelivered && (
          <div className="bg-success-dim border border-success/30 rounded-xl p-4 text-center">
            <CheckCircle2 size={32} className="text-success mx-auto mb-2" />
            <p className="text-success font-bold text-lg">Payout Delivered</p>
            <p className="text-text-secondary text-sm mt-1">
              Funds have been successfully delivered through {payout.partner}.
            </p>
          </div>
        )}

        {/* Footer Actions */}
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