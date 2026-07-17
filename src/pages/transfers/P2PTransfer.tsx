import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../../features/wallet/wallet.store";
import { WalletService } from "../../features/wallet/wallet.service";
import { ArrowLeft, ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";
import GradientButton from "../../components/ui/GradientButton";
import { CURRENCY_TOKEN } from "../../config/constants";

export default function P2PTransfer() {
  const navigate = useNavigate();
  const { wallet, fetchWallet, fetchTransactions } = useWalletStore();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const balance = parseFloat(wallet?.availableBalance || "0");

  const handleTransfer = async () => {
    if (!email.trim() || !numAmount) return;
    if (numAmount > balance) { setError("Insufficient balance"); return; }

    setLoading(true);
    setError("");
    try {
      await WalletService.internalTransfer({
        recipientEmail: email.trim(),
        amount: amount,
      });
      setSuccess(true);
      fetchWallet();
      fetchTransactions();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col">
        <div className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-dim flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <h1 className="text-text-primary text-xl font-bold mb-1">Transfer Sent!</h1>
          <p className="text-text-secondary text-sm mb-6">{numAmount.toFixed(2)} {CURRENCY_TOKEN} sent to {email}</p>
          <GradientButton title="Back to Wallet" onPress={() => navigate("/wallet")} />
          <button
            onClick={() => navigate("/wallet/transactions")}
            className="w-full mt-2 p-3 rounded-md bg-card border border-border text-text-secondary font-semibold text-sm hover:border-text-subtle transition-colors"
          >
            View in History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:border-primary/30 transition-colors">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <div>
          <h1 className="text-text-primary text-xl font-bold">Transfer to User</h1>
          <p className="text-text-secondary text-sm">{`Send ${CURRENCY_TOKEN} to another QuickSend user`}</p>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-3 bg-primary-dim rounded-md p-4 border border-primary-border mb-6">
          <ArrowLeftRight size={18} className="text-primary shrink-0" />
          <p className="text-text-secondary text-sm leading-5">
            Enter the recipient's email address and the amount to transfer instantly between QuickSend users. No fees for internal transfers.
          </p>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <p className="text-text-secondary text-xs mb-1">Recipient Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="user@example.com"
            className="w-full bg-transparent text-text-primary text-base font-semibold outline-none placeholder:text-text-subtle"
          />
        </div>

        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <p className="text-text-secondary text-xs mb-1">{`Amount (${CURRENCY_TOKEN})`}</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }}
            placeholder="0.00"
            className="w-full bg-transparent text-text-primary text-3xl font-bold outline-none placeholder:text-text-subtle"
          />
        </div>

        <div className="bg-card rounded-xl p-4 border border-border mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Your Balance</span>
            <span className="text-text-primary font-medium">{balance.toFixed(2)} {CURRENCY_TOKEN}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Fee</span>
            <span className="text-primary font-medium">Free</span>
          </div>
          {numAmount > 0 && (
            <div className="border-t border-border pt-2 flex justify-between text-sm">
              <span className="text-text-secondary font-semibold">After Transfer</span>
              <span className={`font-bold ${numAmount > balance ? "text-danger" : "text-text-primary"}`}>
                {Math.max(0, balance - numAmount).toFixed(2)} {CURRENCY_TOKEN}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-danger-dim rounded-md p-3 border border-danger/30 mb-4">
            <XCircle size={18} className="text-danger shrink-0 mt-0.5" />
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        <GradientButton
          title={loading ? "Sending..." : "Send Transfer"}
          onPress={handleTransfer}
          loading={loading}
          disabled={!email.trim() || !numAmount || numAmount > balance}
        />
      </div>
    </div>
  );
}
