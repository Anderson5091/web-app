import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { WalletService } from "../../features/wallet/wallet.service";
import { feeApi } from "../../features/fees/fee.api";
import GradientButton from "../../components/ui/GradientButton";
import type { WithdrawalResponse } from "../../features/wallet/wallet.types";

const NETWORKS = ["BASE", "ETHEREUM", "POLYGON", "SOLANA"];

export default function Withdraw() {
  const navigate = useNavigate();
  const { wallet } = useWalletStore();
  const [network, setNetwork] = useState("BASE");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalResult, setWithdrawalResult] =
    useState<WithdrawalResponse | null>(null);
  const [fee, setFee] = useState(0);

  const maxAmount = wallet ? parseFloat(wallet.availableBalance) : 0;
  const parsedAmount = parseFloat(amount) || 0;
  const receiveAmount = amount ? Math.max(0, parsedAmount - fee) : 0;

  useEffect(() => {
    if (!parsedAmount) { setFee(0); return; }
    feeApi.getEstimate("WEB_WITHDRAW", parsedAmount).then((r) => setFee(r.totalFee)).catch(() => setFee(0));
  }, [parsedAmount]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !amount) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await WalletService.withdraw({
        network,
        address,
        amount,
      });
      setWithdrawalResult(result);
      setAddress("");
      setAmount("");
    } catch (err: any) {
      setError(err.message || "Failed to process withdrawal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (withdrawalResult) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col">
        <div className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center mb-6">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h2 className="text-text-primary text-3xl font-bold mb-2">
            Withdrawal Submitted!
          </h2>
          <p className="text-primary text-base font-semibold mb-6">
            {withdrawalResult.amount.toFixed(2)} USDT withdrawn
          </p>
          <div className="bg-card rounded-xl p-4 border border-border w-full space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Amount</span>
              <span className="text-text-primary font-medium">
                {withdrawalResult.amount.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Fee</span>
              <span className="text-text-primary font-medium">
                {withdrawalResult.fee.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-text-primary font-medium">Net Transfer</span>
              <span className="text-primary font-bold">
                {withdrawalResult.netAmount.toFixed(2)} USDT
              </span>
            </div>
            {withdrawalResult.txHash && (
              <div className="pt-2 border-t border-border">
                <span className="text-text-secondary text-sm block mb-1">Transaction Hash</span>
                <span className="text-text-primary font-mono text-xs break-all">
                  {withdrawalResult.txHash}
                </span>
              </div>
            )}
          </div>
          <div className="w-full space-y-3">
            <GradientButton title="Make Another Withdrawal" onPress={() => setWithdrawalResult(null)} />
            <GradientButton title="Back to Wallet" variant="outline" onPress={() => navigate("/wallet")} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <div className="max-w-lg mx-auto w-full p-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/wallet")} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card-alt">
            <ArrowLeft size={18} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-xl font-bold">Withdraw USDT</h1>
            <p className="text-text-secondary text-sm">Withdraw to an external wallet</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-danger-dim rounded-md p-3 border border-danger/30 mb-4">
            <XCircle size={18} className="text-danger shrink-0 mt-0.5" />
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="block text-text-secondary text-sm font-medium mb-2">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-card-alt border border-border rounded-md px-4 py-3 text-text-primary outline-none focus:border-primary appearance-none"
            >
              {NETWORKS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <label className="block text-text-secondary text-sm font-medium mb-2">Destination Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter ${network} address`}
              className="w-full bg-card-alt border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-subtle outline-none focus:border-primary"
              required
            />
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-text-secondary text-sm font-medium">Amount (USDT)</label>
              <span className="text-text-subtle text-xs">Available: ${maxAmount.toFixed(2)}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-card-alt border border-border rounded-md px-4 py-3 pr-20 text-text-primary text-lg font-bold placeholder-text-subtle outline-none focus:border-primary"
                required
              />
              <button
                type="button"
                onClick={() => setAmount(maxAmount.toString())}
                className="absolute right-2 top-2 text-xs font-semibold text-primary bg-primary-dim border border-primary-border px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Network Fee</span>
              <span className="text-text-primary font-medium">{fee.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-text-primary font-semibold">You will receive</span>
              <span className="text-primary font-bold">{receiveAmount.toFixed(2)} USDT</span>
            </div>
          </div>

          <GradientButton
            title={isSubmitting ? "Processing..." : "Confirm Withdrawal"}
            onPress={() => {}}
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              !amount ||
              !address ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > maxAmount
            }
          />
        </form>
      </div>
    </div>
  );
}
