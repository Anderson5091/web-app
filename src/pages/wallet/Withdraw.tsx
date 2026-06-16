import { useState } from "react";
import { ArrowUpRight, AlertCircle, Loader2 } from "lucide-react";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { WalletService } from "../../features/wallet/wallet.service";
import type { WithdrawalResponse } from "../../features/wallet/wallet.types";

const NETWORKS = ["BASE", "ETHEREUM", "POLYGON", "SOLANA"];

const FEE_SCHEDULE: Record<string, number> = {
  BASE: 1,
  POLYGON: 1,
  SOLANA: 1,
  ETHEREUM: 10,
};

export default function Withdraw() {
  const { wallet } = useWalletStore();
  const [network, setNetwork] = useState("BASE");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalResult, setWithdrawalResult] =
    useState<WithdrawalResponse | null>(null);

  const maxAmount = wallet ? parseFloat(wallet.availableBalance) : 0;
  const fee = FEE_SCHEDULE[network] || 1;
  const receiveAmount = amount
    ? Math.max(0, parseFloat(amount) - fee)
    : 0;

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
      <div className="p-4 md:p-6 max-w-lg mx-auto h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce shadow-sm">
          <ArrowUpRight size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Withdrawal Submitted
        </h2>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-medium">
              ${withdrawalResult.amount.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fee</span>
            <span className="font-medium">
              ${withdrawalResult.fee.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="text-gray-700 font-medium">Net Transfer</span>
            <span className="font-bold text-gray-900">
              ${withdrawalResult.netAmount.toFixed(2)} USDT
            </span>
          </div>
          {withdrawalResult.txHash && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-500 block mb-1">Transaction Hash</span>
              <span className="font-mono text-xs break-all text-gray-600">
                {withdrawalResult.txHash}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setWithdrawalResult(null)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition"
        >
          Make Another Withdrawal
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Withdraw USDT</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {NETWORKS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter ${network} address`}
              className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount (USDT)
              </label>
              <span className="text-xs text-gray-500 font-medium">
                Available: ${maxAmount.toFixed(2)}
              </span>
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
                className="w-full border-gray-200 rounded-xl p-3 pr-20 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setAmount(maxAmount.toString())}
                className="absolute right-2 top-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Network Fee</span>
              <span className="font-medium text-gray-700">
                ${fee.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">You will receive</span>
              <span className="font-bold text-gray-900">
                ${receiveAmount.toFixed(2)} USDT
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !amount ||
              !address ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > maxAmount
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 font-semibold shadow-md shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Withdrawal"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
