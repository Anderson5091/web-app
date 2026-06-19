import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Info, TriangleAlert, ArrowLeft, Clock, ExternalLink, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WalletService } from "../../features/wallet/wallet.service";
import type { DepositStatus } from "../../features/wallet/wallet.types";

const NETWORKS = [
  { key: "BASE", name: "Base", symbol: "USDC", icon: "B" },
  { key: "ETHEREUM", name: "Ethereum", symbol: "ERC-20", icon: "E" },
  { key: "POLYGON", name: "Polygon", symbol: "MATIC", icon: "P" },
  { key: "SOLANA", name: "Solana", symbol: "SPL", icon: "S" },
];

const FEE_RATE = 0.01;
const REQUIRED_CONFIRMATIONS = 5;

type Step = "network" | "amount" | "address" | "pending" | "completed";

export default function Deposit() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("network");
  const [selectedNetwork, setSelectedNetwork] = useState<typeof NETWORKS[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositStatus, setDepositStatus] = useState<DepositStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [txHashCopied, setTxHashCopied] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * FEE_RATE;
  const netAmount = parsedAmount - fee;

  const pollStatus = useCallback(async () => {
    if (!depositId) return;
    try {
      const status = await WalletService.getDepositStatus(depositId);
      setDepositStatus(status);
      if (status.status === "DETECTED" && step === "address") setStep("pending");
      if (status.status === "COMPLETED") setStep("completed");
    } catch {
      /* ignore polling errors */
    }
  }, [depositId, step]);

  useEffect(() => {
    if (step !== "address" && step !== "pending") return;
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [step, pollStatus]);

  useEffect(() => {
    if (step !== "address" || !depositStatus?.expiresAt) return;
    const expiry = new Date(depositStatus.expiresAt).getTime();
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        navigate("/wallet", { replace: true });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [step, depositStatus?.expiresAt, navigate]);

  const handleCreateDeposit = async () => {
    if (!selectedNetwork || !amount) return;
    setCreating(true);
    try {
      const result = await WalletService.createDeposit({
        chain: selectedNetwork.key,
      });
      setDepositId(result.depositId);
      const status = await WalletService.getDepositStatus(result.depositId);
      setDepositStatus(status);
      setStep("address");
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const qrData = depositStatus?.address
    ? `${depositStatus.address}?amount=${parsedAmount.toFixed(2)}`
    : "";

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const explorerUrl = (txHash: string, network: string) => {
    const explorers: Record<string, string> = {
      BASE: "https://basescan.org/tx/",
      ETHEREUM: "https://etherscan.io/tx/",
      POLYGON: "https://polygonscan.com/tx/",
      SOLANA: "https://solscan.io/tx/",
    };
    return `${explorers[network] || ""}${txHash}`;
  };

  if (step === "network") {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col">
        <div className="flex items-center gap-3 p-4 pb-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-xl font-bold">Add Funds</h1>
            <p className="text-text-secondary text-sm">Select network to deposit USDT</p>
          </div>
        </div>
        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          <div className="flex gap-3 bg-primary-dim rounded-md p-4 border border-primary-border mb-6">
            <Info size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-text-secondary text-sm leading-5">
              Choose a network, enter the amount, and we'll generate a deposit address for you.
            </p>
          </div>
          <p className="text-text-primary text-sm font-semibold mb-3">Select Network</p>
          {NETWORKS.map((net) => {
            const isSelected = selectedNetwork?.key === net.key;
            return (
              <button
                key={net.key}
                onClick={() => { setSelectedNetwork(net); setStep("amount"); }}
                className={`w-full bg-card rounded-xl p-4 border mb-3 text-left transition-colors ${
                  isSelected ? "border-primary-border" : "border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-dim flex items-center justify-center">
                    <span className="text-primary text-xl font-bold">{net.icon}</span>
                  </div>
                  <div>
                    <p className="text-text-primary text-base font-semibold">{net.name}</p>
                    <p className="text-text-subtle text-xs">{net.symbol}</p>
                  </div>
                </div>
              </button>
            );
          })}
          <div className="flex gap-3 bg-warning-dim rounded-md p-4 border border-warning/30 mt-4">
            <TriangleAlert size={18} className="text-warning shrink-0 mt-0.5" />
            <p className="text-warning text-xs leading-5">
              Only send USDT to the matching network address. Sending the wrong token or using the wrong network may result in permanent loss of funds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "amount") {
    const isValid = parsedAmount > 0;
    return (
      <div className="min-h-screen bg-app-bg flex flex-col">
        <div className="flex items-center gap-3 p-4 pb-2">
          <button onClick={() => setStep("network")} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-xl font-bold">Add Funds</h1>
            <p className="text-text-secondary text-sm">Enter amount to deposit</p>
          </div>
        </div>
        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center">
              <span className="text-primary text-lg font-bold">{selectedNetwork!.icon}</span>
            </div>
            <div>
              <p className="text-text-primary font-semibold">{selectedNetwork!.name}</p>
              <p className="text-text-subtle text-xs">{selectedNetwork!.symbol}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border mt-4">
            <p className="text-text-secondary text-xs mb-1">Amount (USDT)</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-text-primary text-3xl font-bold outline-none placeholder:text-text-subtle"
            />
          </div>
          {parsedAmount > 0 && (
            <div className="bg-card rounded-xl p-4 border border-border mt-4 space-y-2">
              <p className="text-text-primary text-sm font-semibold mb-2">Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Network</span>
                <span className="text-text-primary font-medium">{selectedNetwork!.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Deposit Amount</span>
                <span className="text-text-primary font-medium">{parsedAmount.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Fee (1%)</span>
                <span className="text-text-primary font-medium">{fee.toFixed(2)} USDT</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="text-text-secondary font-semibold">You will receive</span>
                <span className="text-primary font-bold">{netAmount.toFixed(2)} USDT</span>
              </div>
            </div>
          )}
          <button
            onClick={handleCreateDeposit}
            disabled={!isValid || creating}
            className="w-full mt-6 p-3 rounded-md bg-primary text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {creating ? <><Loader size={16} className="animate-spin" /> Generating...</> : "Create Deposit Address"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "address" && depositStatus) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col">
        <div className="flex items-center gap-3 p-4 pb-2">
          <button onClick={() => navigate("/wallet", { replace: true })} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-xl font-bold">Deposit Address</h1>
            <p className="text-text-secondary text-sm">Send USDT to this address</p>
          </div>
        </div>
        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          {countdown <= 60 && (
            <div className="flex items-center gap-2 bg-warning-dim rounded-md p-3 border border-warning/30 mb-4">
              <Clock size={16} className="text-warning shrink-0" />
              <p className="text-warning text-xs font-medium">Expires in {formatTime(countdown)}</p>
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center">
              <span className="text-primary text-lg font-bold">{selectedNetwork!.icon}</span>
            </div>
            <div>
              <p className="text-text-primary font-semibold">{selectedNetwork!.name} - USDT</p>
              <p className="text-text-subtle text-xs">Send only USDT to this address</p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border mb-4">
            <div className="bg-app-bg rounded-md p-4 border border-border">
              <p className="text-text-secondary text-xs font-mono break-all leading-5">{depositStatus.address}</p>
            </div>
            <button
              onClick={() => copyToClipboard(depositStatus.address!, setCopied)}
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-md border text-sm font-semibold transition-colors mt-3 ${
                copied
                  ? "bg-primary-dim border-primary-border text-primary"
                  : "bg-card-alt border-border text-text-secondary hover:border-text-subtle"
              }`}
            >
              {copied ? <><Check size={18} className="text-primary" /> Copied!</> : <><Copy size={18} /> Copy Address</>}
            </button>
          </div>
          <div className="flex justify-center p-4 bg-card rounded-xl border border-border mb-4">
            <div className="p-3 bg-white rounded-lg">
              <QRCodeSVG value={qrData} size={200} level="M" includeMargin />
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border space-y-2">
            <p className="text-text-primary text-sm font-semibold">Deposit Details</p>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Amount</span>
              <span className="text-text-primary font-medium">{depositStatus.amount || `${parsedAmount.toFixed(2)}`} USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Fee</span>
              <span className="text-text-primary font-medium">{depositStatus.fee || `${fee.toFixed(2)}`} USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Network Fee</span>
              <span className="text-text-primary font-medium">Covered by us</span>
            </div>
          </div>
          <div className="flex gap-3 bg-primary-dim rounded-md p-4 border border-primary-border mt-4">
            <Info size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-text-secondary text-xs leading-5">
              Send the exact amount to the address above. Once detected, it may take a few minutes for network confirmations. The address expires in {formatTime(countdown)}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "pending" && depositStatus) {
    const conf = depositStatus.confirmations || 0;
    const progress = Math.min(conf / REQUIRED_CONFIRMATIONS, 1);
    return (
      <div className="min-h-screen bg-app-bg flex flex-col">
        <div className="flex items-center gap-3 p-4 pb-2">
          <button onClick={() => navigate("/wallet", { replace: true })} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-xl font-bold">Deposit Pending</h1>
            <p className="text-text-secondary text-sm">Waiting for network confirmation</p>
          </div>
        </div>
        <div className="flex-1 p-4 max-w-lg mx-auto w-full">
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <Loader size={40} className="text-primary animate-spin mx-auto mb-4" />
            <p className="text-text-primary text-lg font-bold mb-1">Transaction Detected</p>
            <p className="text-text-secondary text-sm mb-4">Waiting for network confirmations</p>
            <div className="flex items-center justify-center gap-2 mb-4">
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
            <div className="w-full bg-card-alt rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-text-secondary text-sm">
              Confirmations: <span className="text-text-primary font-semibold">{conf} / {REQUIRED_CONFIRMATIONS}</span>
            </p>
          </div>
          {depositStatus.txHash && (
            <div className="bg-card rounded-xl p-4 border border-border mt-4">
              <p className="text-text-secondary text-xs mb-2">Transaction Hash</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-text-primary text-xs font-mono truncate">{depositStatus.txHash}</p>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => copyToClipboard(depositStatus.txHash!, setTxHashCopied)}
                    className="p-2 rounded-md bg-card-alt border border-border hover:border-text-subtle"
                  >
                    {txHashCopied ? <Check size={14} className="text-primary" /> : <Copy size={14} className="text-text-secondary" />}
                  </button>
                  <a
                    href={explorerUrl(depositStatus.txHash, depositStatus.network)}
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
          <div className="bg-card rounded-xl p-4 border border-border mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Amount</span>
              <span className="text-text-primary font-medium">{depositStatus.amount || `${parsedAmount.toFixed(2)}`} USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Network</span>
              <span className="text-text-primary font-medium">{depositStatus.network}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "completed") {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col">
        <div className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-dim flex items-center justify-center mb-4">
            <Check size={32} className="text-primary" />
          </div>
          <h1 className="text-text-primary text-xl font-bold mb-1">Deposit Received</h1>
          <p className="text-text-secondary text-sm mb-6">Funds have been credited to your wallet.</p>
          <div className="bg-card rounded-xl p-4 border border-border w-full space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Amount Received</span>
              <span className="text-text-primary font-bold">{depositStatus?.netAmount || `${netAmount.toFixed(2)}`} USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Network</span>
              <span className="text-text-primary font-medium">{depositStatus?.network || selectedNetwork?.name}</span>
            </div>
            {depositStatus?.txHash && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Transaction</span>
                <a
                  href={explorerUrl(depositStatus.txHash, depositStatus.network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center gap-1"
                >
                  View <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/wallet", { replace: true })}
            className="w-full p-3 rounded-md bg-primary text-white font-semibold text-sm"
          >
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  return null;
}