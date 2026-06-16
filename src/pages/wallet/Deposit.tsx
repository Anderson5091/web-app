import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Info, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NETWORKS = [
  { key: "TRON", name: "TRON", symbol: "TRC-20", icon: "T", address: "TQn7zKG5dHN4PL8JKnCWHkA5QvRmM2uXz" },
  { key: "ETHEREUM", name: "Ethereum", symbol: "ERC-20", icon: "E", address: "0x3f4d8c1a9B2e7f6D0cA4b8E3F1d2C5a6B7e8F9c" },
  { key: "POLYGON", name: "Polygon", symbol: "MATIC", icon: "P", address: "0x7aB1cD3e8F2a4B6C9d0E1f3A5b7C8d9E0f1A2b3" },
  { key: "SOLANA", name: "Solana", symbol: "SPL", icon: "S", address: "9xTzK3mRvL8nQpW2jB7cF4eH6iY1aU5oD0gN3kM" },
];

export default function Deposit() {
  const navigate = useNavigate();
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(selectedNetwork.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <div>
          <h1 className="text-text-primary text-xl font-bold">Add Funds</h1>
          <p className="text-text-secondary text-sm">Deposit USDT to your wallet</p>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* Info box */}
        <div className="flex gap-3 bg-primary-dim rounded-md p-4 border border-primary-border mb-6">
          <Info size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-text-secondary text-sm leading-5">
            Send USDT to any of the addresses below. Funds are credited after network confirmation (usually within minutes).
          </p>
        </div>

        {NETWORKS.map((net) => {
          const isSelected = selectedNetwork.key === net.key;
          return (
            <div key={net.key} className={`bg-card rounded-xl p-4 border mb-4 ${isSelected ? "border-primary-border" : "border-border"}`}>
              <button
                onClick={() => { setSelectedNetwork(net); setCopied(false); }}
                className="flex items-center gap-4 w-full text-left"
              >
                <div className="w-12 h-12 rounded-full bg-primary-dim flex items-center justify-center">
                  <span className="text-primary text-xl font-bold">{net.icon}</span>
                </div>
                <div>
                  <p className="text-text-primary text-base font-semibold">{net.name}</p>
                  <p className="text-text-subtle text-xs">{net.symbol}</p>
                </div>
              </button>

              {isSelected && (
                <div className="mt-4 space-y-4">
                  <div className="bg-app-bg rounded-md p-4 border border-border">
                    <p className="text-text-secondary text-xs font-mono break-all leading-5">{net.address}</p>
                  </div>
                  <button
                    onClick={copyAddress}
                    className={`w-full flex items-center justify-center gap-2 p-3 rounded-md border text-sm font-semibold transition-colors ${
                      copied
                        ? "bg-primary-dim border-primary-border text-primary"
                        : "bg-card-alt border-border text-text-secondary hover:border-text-subtle"
                    }`}
                  >
                    {copied ? <><Check size={18} className="text-primary" /> Copied!</> : <><Copy size={18} /> Copy Address</>}
                  </button>

                  {/* QR Code */}
                  <div className="flex justify-center p-4 bg-app-bg rounded-md border border-border">
                    <div className="p-3 bg-white rounded-lg">
                      <QRCodeSVG value={net.address} size={180} level="M" includeMargin />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Warning */}
        <div className="flex gap-3 bg-warning-dim rounded-md p-4 border border-warning/30">
          <TriangleAlert size={18} className="text-warning shrink-0 mt-0.5" />
          <p className="text-warning text-xs leading-5">
            Only send USDT to the matching network address. Sending the wrong token or using the wrong network may result in permanent loss of funds.
          </p>
        </div>
      </div>
    </div>
  );
}
