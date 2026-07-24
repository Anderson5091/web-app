import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBeneficiaryStore } from "../../features/beneficiaries/beneficiary.store";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { useTransferStore } from "../../features/transfers/transfer.store";
import { feeApi } from "../../features/fees/fee.api";
import { ArrowLeft, Check, CheckCircle2, Shield } from "lucide-react";
import GradientButton from "../../components/ui/GradientButton";
import type { Beneficiary } from "../../features/beneficiaries/beneficiary.types";
import { CURRENCY_TOKEN } from "../../config/constants";

const FX_RATES: Record<string, { rate: number; currency: string; flag: string }> = {
  Philippines: { rate: 57.0, currency: "PHP", flag: "🇵🇭" },
  Ghana: { rate: 15.0, currency: "GHS", flag: "🇬🇭" },
  China: { rate: 7.25, currency: "CNY", flag: "🇨🇳" },
  UAE: { rate: 3.67, currency: "AED", flag: "🇦🇪" },
  India: { rate: 83.5, currency: "INR", flag: "🇮🇳" },
  Mexico: { rate: 17.2, currency: "MXN", flag: "🇲🇽" },
  Nigeria: { rate: 1580, currency: "NGN", flag: "🇳🇬" },
  Kenya: { rate: 130, currency: "KES", flag: "🇰🇪" },
};

const STATUS_STEPS = [
  { key: "created", label: "Transfer Created" },
  { key: "compliance_review", label: "Compliance Review" },
  { key: "treasury", label: "Treasury" },
  { key: "partner_processing", label: "Partner Processing" },
  { key: "delivered", label: "Delivered" },
];

export default function SendMoney() {
  const navigate = useNavigate();
  const { beneficiaries, fetchBeneficiaries } = useBeneficiaryStore();
  const { wallet } = useWalletStore();
  const { submitTransfer, activeTransfer } = useTransferStore();

  useEffect(() => { fetchBeneficiaries(); }, [fetchBeneficiaries]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transferError, setTransferError] = useState("");

  const selectedBen = beneficiaries.find((b) => b.id === selectedId);
  const numAmount = parseFloat(amount) || 0;
  const maxAmount = wallet ? parseFloat(wallet.availableBalance) : 0;
  const country = selectedBen?.country || "Philippines";
  const fxInfo = FX_RATES[country] || { rate: 1, currency: "USD", flag: "🌍" };
  const [fee, setFee] = useState(0);
  useEffect(() => {
    if (!numAmount) { setFee(0); return; }
    feeApi.getEstimate("WEB_TRANSFER", numAmount).then((r) => setFee(r.totalFee)).catch(() => setFee(0));
  }, [numAmount]);
  const total = numAmount + fee;
  const localAmount = numAmount * fxInfo.rate;
  const isValid = numAmount > 0 && total <= maxAmount;

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const formatMethod = (m: string) =>
    m.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <div className="max-w-xl mx-auto w-full p-4">
        {step < 4 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              {step > 1 && (
                <button
                  onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card-alt"
                >
                  <ArrowLeft size={18} className="text-text-primary" />
                </button>
              )}
              <div>
                <h1 className="text-text-primary text-2xl font-bold">Send Money</h1>
                <p className="text-text-secondary text-sm">
                  {step === 1 && "Step 1 of 4 — Choose Recipient"}
                  {step === 2 && "Step 2 of 4 — Enter Amount"}
                  {step === 3 && "Step 3 of 4 — Review"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step > s
                      ? "bg-primary-dim border border-primary text-primary"
                      : step === s
                      ? "bg-primary border-primary text-white"
                      : "bg-card border border-border text-text-secondary"
                  }`}
                >
                  {step > s ? <Check size={14} className="text-primary" /> : s}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            <p className="text-text-secondary text-sm mb-4">Select a saved recipient to send money to.</p>
            <div className="space-y-1">
              {beneficiaries.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <svg className="w-12 h-12 text-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <p className="text-text-secondary text-base font-semibold">No recipients saved yet</p>
                  <button onClick={() => navigate("/beneficiaries")} className="text-primary text-base font-medium">
                    + Add a recipient first
                  </button>
                </div>
              ) : (
                beneficiaries.map((b) => (
                  <BeneficiarySelectCard
                    key={b.id}
                    beneficiary={b}
                    selected={selectedId === b.id}
                    onPress={() => setSelectedId(b.id === selectedId ? null : b.id)}
                  />
                ))
              )}
            </div>
            {beneficiaries.length > 0 && (
              <div className="mt-4">
                <GradientButton title="Continue" onPress={() => setStep(2)} disabled={!selectedId} />
              </div>
            )}
          </>
        )}

        {step === 2 && selectedBen && (
          <>
            <div className="flex items-center gap-4 bg-card rounded-lg p-4 border border-border mb-6">
              <div className="w-[46px] h-[46px] rounded-full bg-secondary-dim flex items-center justify-center">
                <span className="text-secondary text-base font-bold">{getInitials(selectedBen.fullName)}</span>
              </div>
              <div>
                <p className="text-text-primary text-base font-semibold">{selectedBen.fullName}</p>
                <p className="text-text-secondary text-sm mt-0.5">{fxInfo.flag} {selectedBen.country}</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border mb-6 text-center">
              <p className="text-primary text-sm font-semibold mb-2">{CURRENCY_TOKEN}</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle text-2xl">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-text-primary text-5xl font-bold text-center outline-none"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            {numAmount > 0 && (
              <div className="bg-card rounded-lg p-4 border border-border space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Recipient gets</span>
                  <span className="text-primary text-base font-bold">{fxInfo.currency} {localAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">FX Rate</span>
                  <span className="text-text-primary text-sm">{`1 ${CURRENCY_TOKEN} = ${fxInfo.rate} ${fxInfo.currency}`}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Fee</span>
                  <span className="text-warning text-sm font-semibold">{`+${fee.toFixed(2)} ${CURRENCY_TOKEN}`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-primary text-base font-semibold">Total Deducted</span>
                  <span className={`text-lg font-bold ${total > maxAmount ? "text-danger" : "text-text-primary"}`}>
                    {total.toFixed(2)} {CURRENCY_TOKEN}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-1 mb-4">
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              <span className="text-text-secondary text-sm">Available: <span className="text-primary">{maxAmount.toFixed(2)} {CURRENCY_TOKEN}</span></span>
            </div>

            {total > maxAmount && numAmount > 0 && (
              <div className="flex items-center gap-2 bg-danger-dim rounded-md p-3 border border-danger/30 mb-4">
                <svg className="w-4 h-4 text-danger shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <span className="text-danger text-sm">{`Insufficient balance. Please deposit more ${CURRENCY_TOKEN}.`}</span>
              </div>
            )}

            <GradientButton title="Continue Transfer" onPress={() => setStep(3)} disabled={!isValid} />
          </>
        )}

        {step === 3 && selectedBen && (
          <>
            <div className="bg-gradient-to-r from-[#00D6A3] to-[#0084FF] rounded-xl p-6 text-center mb-6">
              <p className="text-white/75 text-sm mb-1">Sending</p>
              <h2 className="text-white text-3xl font-bold">{numAmount.toFixed(2)} {CURRENCY_TOKEN}</h2>
              <p className="text-white/60 text-2xl my-1">↓</p>
              <p className="text-white text-2xl font-semibold">{fxInfo.currency} {localAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
              <p className="text-white/70 text-sm mt-1">to {selectedBen.fullName}</p>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border mb-3">
              <p className="text-text-secondary text-[10px] font-semibold tracking-wider uppercase mb-3">Transfer Details</p>
              <ReviewRow label="Recipient" value={selectedBen.fullName} />
              <ReviewRow label="Country" value={`${fxInfo.flag} ${selectedBen.country}`} />
              <ReviewRow label="Payout Method" value={formatMethod(selectedBen.payoutMethod)} />
              {selectedBen.bankName && <ReviewRow label="Bank" value={selectedBen.bankName} />}
              {selectedBen.accountNumber && <ReviewRow label="Account" value={selectedBen.accountNumber} />}
            </div>

            <div className="bg-card rounded-lg p-4 border border-border mb-3">
              <p className="text-text-secondary text-[10px] font-semibold tracking-wider uppercase mb-3">Fee Breakdown</p>
              <ReviewRow label="Transfer Amount" value={`${numAmount.toFixed(2)} ${CURRENCY_TOKEN}`} />
              <ReviewRow label="Transfer Fee" value={`${fee.toFixed(2)} ${CURRENCY_TOKEN}`} />
              <ReviewRow label="FX Rate" value={`1 ${CURRENCY_TOKEN} = ${fxInfo.rate} ${fxInfo.currency}`} />
              <div className="h-px bg-border my-2" />
              <ReviewRow label="Total Deducted" value={`${total.toFixed(2)} ${CURRENCY_TOKEN}`} highlight />
              <ReviewRow label="Recipient Gets" value={`${fxInfo.currency} ${localAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} highlight />
            </div>

            <div className="flex gap-2 bg-primary-dim rounded-md p-3 border border-primary-border mb-6">
              <Shield size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-text-secondary text-xs leading-5">
                Transfer will undergo AML compliance review before processing. Estimated delivery: 1-3 business days.
              </p>
            </div>

            {transferError && (
              <div className="mb-4 p-3 bg-danger-dim border border-danger/30 rounded-md text-sm text-danger font-medium">
                {transferError}
              </div>
            )}
            <GradientButton title="Confirm & Send" onPress={async () => {
              if (!selectedBen) return;
              setLoading(true);
              setTransferError("");
              try {
                await submitTransfer({
                  beneficiaryId: selectedBen.id,
                  amount: numAmount,
                  payoutMethod: selectedBen.payoutMethod as "BANK" | "MOBILE_MONEY" | "CASH_PICKUP",
                });
                setStep(4);
              } catch (err: any) {
                setTransferError(err?.response?.data?.error || err?.message || "Transfer failed");
              } finally {
                setLoading(false);
              }
            }} loading={loading} />
          </>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center mb-6">
              <CheckCircle2 size={48} className="text-white" />
            </div>
            <h2 className="text-text-primary text-3xl font-bold mb-2">Transfer Submitted!</h2>
            <p className="text-primary text-base font-semibold mb-1">{numAmount.toFixed(2)} {CURRENCY_TOKEN} sent to {selectedBen?.fullName}</p>
            {activeTransfer?.referenceId && (
              <p className="text-text-subtle text-sm font-mono mb-3">Ref: {activeTransfer.referenceId}</p>
            )}
            <p className="text-text-secondary text-sm text-center leading-6 mb-8 max-w-sm">
              Your transfer is now undergoing compliance review. You can track the status in real time.
            </p>

            <div className="flex items-start gap-0 mb-8">
              {STATUS_STEPS.map((s, i) => (
                <div key={s.key} className="flex flex-col items-center w-14">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    i === 0 ? "bg-primary border-primary" : "bg-card border-border"
                  }`}>
                    {i === 0 && <Check size={12} className="text-white" />}
                  </div>
                  {i < 4 && <div className="w-14 h-0.5 bg-border mt-[11px] -ml-0" />}
                  <p className={`text-[9px] text-center mt-1 ${i === 0 ? "text-primary" : "text-text-subtle"}`}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="w-full space-y-3">
              <GradientButton title="Track Transfer" onPress={() => navigate("/wallet/transactions")} />
              <GradientButton title="Back to Dashboard" variant="outline" onPress={() => navigate("/home")} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BeneficiarySelectCard({ beneficiary, selected, onPress }: {
  beneficiary: Beneficiary;
  selected: boolean;
  onPress: () => void;
}) {
  const initials = beneficiary.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const methodLabels: Record<string, string> = {
    BANK: "Bank Transfer",
    MOBILE_MONEY: "Mobile Wallet",
    CASH_PICKUP: "Cash Pickup",
  };

  return (
    <button
      onClick={onPress}
      className={`w-full flex items-center gap-4 bg-card rounded-lg border p-4 mb-2 transition-colors text-left ${
        selected ? "border-primary bg-primary-dim" : "border-border hover:bg-card-alt"
      }`}
    >
      <div className="w-[46px] h-[46px] rounded-full bg-secondary-dim flex items-center justify-center shrink-0">
        <span className="text-secondary text-base font-bold">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-semibold">{beneficiary.fullName}</p>
        <p className="text-text-secondary text-xs mt-0.5">{beneficiary.country} · {methodLabels[beneficiary.payoutMethod]}</p>
      </div>
      <div className="shrink-0">
        <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
          selected ? "border-primary" : "border-border"
        }`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
      </div>
    </button>
  );
}

function ReviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-primary text-base" : "text-text-primary"}`}>{value}</span>
    </div>
  );
}
