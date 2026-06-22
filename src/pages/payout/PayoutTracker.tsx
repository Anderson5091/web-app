import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { usePayoutStore } from "../../features/payout/payout.store";
import { payoutApi } from "../../features/payout/payout.api";
import type { PayoutStatus, PartnerSlaMetric } from "../../features/payout/payout.types";
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Send,
  ExternalLink,
  Building2,
  Smartphone,
  MapPin,
  Activity,
  TrendingUp,
} from "lucide-react";

const statusConfig: Record<
  PayoutStatus,
  { label: string; color: string; icon: typeof Clock; step: number }
> = {
  PENDING: { label: "Pending", color: "text-yellow-500 bg-yellow-50 border-yellow-200", icon: Clock, step: 0 },
  QUEUED: { label: "Queued", color: "text-blue-500 bg-blue-50 border-blue-200", icon: Loader2, step: 1 },
  PROCESSING: { label: "Processing", color: "text-indigo-500 bg-indigo-50 border-indigo-200", icon: Loader2, step: 2 },
  SENT_TO_PARTNER: { label: "Sent to Partner", color: "text-purple-500 bg-purple-50 border-purple-200", icon: Send, step: 3 },
  CONFIRMED: { label: "Confirmed", color: "text-teal-500 bg-teal-50 border-teal-200", icon: CheckCircle2, step: 4 },
  DELIVERED: { label: "Delivered", color: "text-emerald-500 bg-emerald-50 border-emerald-200", icon: CheckCircle2, step: 5 },
  FAILED: { label: "Failed", color: "text-rose-500 bg-rose-50 border-rose-200", icon: XCircle, step: -1 },
};

const statusSteps: PayoutStatus[] = [
  "PENDING",
  "QUEUED",
  "PROCESSING",
  "SENT_TO_PARTNER",
  "CONFIRMED",
  "DELIVERED",
];

function getPartnerIcon(method?: string) {
  switch (method) {
    case "BANK": return <Building2 size={20} className="text-blue-500" />;
    case "MOBILE_MONEY": return <Smartphone size={20} className="text-purple-500" />;
    case "CASH_PICKUP": return <MapPin size={20} className="text-emerald-500" />;
    default: return <Building2 size={20} className="text-slate-400" />;
  }
}

export default function PayoutTracker() {
  const { id } = useParams<{ id: string }>();
  const { currentPayout, getPayoutStatus, retryPayout, listenForUpdates, isLoading, error } = usePayoutStore();
  const [retrying, setRetrying] = useState(false);
  const [partnerMetrics, setPartnerMetrics] = useState<PartnerSlaMetric | null>(null);

  useEffect(() => {
    if (!currentPayout?.partner || currentPayout.partner === "ROUTING_FAILED") return;

    let cancelled = false;
    payoutApi.getPartnerMetrics(currentPayout.id).then((res) => {
      if (!cancelled && res.data) setPartnerMetrics(res.data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [currentPayout?.partner, currentPayout?.id]);

  useEffect(() => {
    if (id) {
      getPayoutStatus(id);
    }
  }, [id, getPayoutStatus]);

  useEffect(() => {
    if (currentPayout?.id) {
      const cleanup = listenForUpdates(currentPayout.id);
      return cleanup;
    }
  }, [currentPayout?.id, listenForUpdates]);

  const handleRetry = async () => {
    if (!currentPayout) return;
    setRetrying(true);
    await retryPayout(currentPayout.id);
    setRetrying(false);
  };

  if (isLoading && !currentPayout) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium">Loading payout status...</p>
        </div>
      </div>
    );
  }

  if (!currentPayout) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-100 shadow-sm">
          <XCircle size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Payout Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">This payout order could not be located.</p>
          <Link
            to="/wallet/transactions"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline"
          >
            <ArrowLeft size={16} /> Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const config = statusConfig[currentPayout.status];
  const currentStepIndex = config.step;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/wallet/transactions"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payout Status</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time tracking of your payout settlement
          </p>
        </div>

        <div className="space-y-5">
          {/* Status Banner */}
          <div
            className={`rounded-2xl border p-5 ${error ? "border-rose-200 bg-rose-50" : config.color}`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                <StatusIcon
                  size={28}
                  className={
                    currentPayout.status === "FAILED"
                      ? "text-rose-500"
                      : currentPayout.status === "DELIVERED"
                        ? "text-emerald-500"
                        : "text-indigo-500"
                  }
                />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-lg capitalize">
                  {config.label}
                </p>
                <p className="text-sm text-slate-500">
                  {currentPayout.status === "FAILED"
                    ? "The payout could not be completed. Please retry or contact support."
                    : currentPayout.status === "DELIVERED"
                      ? "Funds have been successfully delivered to the recipient."
                      : "Your payout is being processed through the settlement network."}
                </p>
              </div>
            </div>
          </div>

          {/* Order Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Settlement Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-mono text-sm font-bold text-slate-800">{currentPayout.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Partner</p>
                <p className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                  {getPartnerIcon(currentPayout.payoutMethod)}
                  {currentPayout.partner}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Attempts</p>
                <p className="font-semibold text-sm text-slate-800">{currentPayout.attemptCount} / 3</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">External Ref</p>
                <p className="font-mono text-xs font-semibold text-slate-800">
                  {currentPayout.externalReference || "—"}
                </p>
              </div>
            </div>
            {currentPayout.externalReference && (
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 border border-slate-100">
                <ExternalLink size={14} className="text-indigo-500" />
                <span className="text-xs text-slate-600 font-medium">Partner Reference: </span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {currentPayout.externalReference}
                </span>
              </div>
            )}
          </div>

          {/* Partner Routing Info */}
          {currentPayout.partner && currentPayout.partner !== "ROUTING_FAILED" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Partner Network</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Routed Through</p>
                  <p className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                    {getPartnerIcon(currentPayout.payoutMethod)}
                    {currentPayout.partner}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Payout Method</p>
                  <p className="font-semibold text-sm text-slate-800">{currentPayout.payoutMethod?.replace(/_/g, " ")}</p>
                </div>
              </div>
              {partnerMetrics && (
                <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700">SLA Performance</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-emerald-600">{partnerMetrics.successRate ?? "—"}%</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">Success Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-indigo-600">{partnerMetrics.avgResponseTimeMs ?? "—"}ms</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">Avg Response</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600">{partnerMetrics.failureCount}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">Failures</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline Progress */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-5">
              Settlement Timeline
            </h3>
            <div className="space-y-0">
              {statusSteps.map((stepStatus, index) => {
                const step = statusConfig[stepStatus];
                const isCompleted = currentStepIndex > index;
                const isCurrent = currentStepIndex === index;
                const isFailed = currentPayout.status === "FAILED";

                return (
                  <div key={stepStatus} className="flex gap-4">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : isCurrent
                              ? "bg-indigo-500 border-indigo-500 text-white"
                              : "bg-white border-slate-200 text-slate-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={16} />
                        ) : isCurrent ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-10 ${
                            isCompleted ? "bg-emerald-200" : "bg-slate-100"
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className={`pb-8 ${index === statusSteps.length - 1 ? "pb-0" : ""}`}>
                      <p
                        className={`font-semibold text-sm ${
                          isCompleted
                            ? "text-emerald-600"
                            : isCurrent
                              ? "text-indigo-600"
                              : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isCompleted
                          ? "Completed"
                          : isCurrent && isFailed
                            ? "Failed"
                            : isCurrent
                              ? "In progress..."
                              : "Waiting"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Failed State Actions */}
          {currentPayout.status === "FAILED" && (
            <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <XCircle size={20} className="text-rose-500" />
                <h3 className="font-bold text-slate-800">Retry Payout</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                You can retry this payout. It will be re-queued with exponential backoff (max 3
                attempts).
              </p>
              <button
                onClick={handleRetry}
                disabled={retrying || currentPayout.attemptCount >= 3}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-2xl p-4 font-bold shadow-lg shadow-rose-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {retrying ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <RefreshCw size={20} />
                )}
                {currentPayout.attemptCount >= 3
                  ? "Max Retries Reached"
                  : `Retry Payout (Attempt ${currentPayout.attemptCount + 1}/3)`}
              </button>
            </div>
          )}

          {/* Delivered Success Actions */}
          {currentPayout.status === "DELIVERED" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-emerald-800 text-lg">Payout Delivered</h3>
              <p className="text-sm text-emerald-600 mt-1">
                Funds have been successfully settled through {currentPayout.partner}.
              </p>
            </div>
          )}

          {/* Navigate Back */}
          <div className="text-center pt-2">
            <Link
              to="/wallet/transactions"
              className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              ← Back to Transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
