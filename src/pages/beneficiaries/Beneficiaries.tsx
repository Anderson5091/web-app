import { useEffect, useState } from "react";
import { useBeneficiaryStore } from "../../features/beneficiaries/beneficiary.store";
import { Plus, Users, X, Building2, Smartphone, MapPin } from "lucide-react";
import type { CreateBeneficiaryPayload } from "../../features/beneficiaries/beneficiary.types";
import GradientButton from "../../components/ui/GradientButton";

const COUNTRIES = [
  { name: "Philippines", code: "PH" },
  { name: "Ghana", code: "GH" },
  { name: "China", code: "CN" },
  { name: "UAE", code: "AE" },
  { name: "India", code: "IN" },
  { name: "Mexico", code: "MX" },
  { name: "Nigeria", code: "NG" },
  { name: "Kenya", code: "KE" },
  { name: "Haiti", code: "HT" },
];

const PAYOUT_METHODS = [
  { key: "BANK" as const, label: "Bank Transfer", icon: Building2 },
  { key: "MOBILE_MONEY" as const, label: "Mobile Wallet", icon: Smartphone },
  { key: "CASH_PICKUP" as const, label: "Cash Pickup", icon: MapPin },
];

export default function Beneficiaries() {
  const { beneficiaries, fetchBeneficiaries, addBeneficiary, deleteBeneficiary, isLoading } = useBeneficiaryStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [payoutMethod, setPayoutMethod] = useState<"BANK" | "MOBILE_MONEY" | "CASH_PICKUP">("BANK");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [mobileProvider, setMobileProvider] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");
  const [cashPickupLocation, setCashPickupLocation] = useState("");

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const resetForm = () => {
    setFullName("");
    setSelectedCountry(COUNTRIES[0]);
    setPayoutMethod("BANK");
    setBankName("");
    setAccountNumber("");
    setMobileProvider("");
    setMobileWalletNumber("");
    setCashPickupLocation("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setIsSubmitting(true);
    try {
      const payload: CreateBeneficiaryPayload = {
        fullName: fullName.trim(),
        country: selectedCountry.name,
        payoutMethod,
        ...(payoutMethod === "BANK" && { bankName, accountNumber }),
        ...(payoutMethod === "MOBILE_MONEY" && { mobileWalletNumber, mobileProvider }),
        ...(payoutMethod === "CASH_PICKUP" && { cashPickupLocation }),
      };
      await addBeneficiary(payload);
      setIsAddModalOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMethodIcon = (method: string) => {
    switch (method) {
      case "BANK": return <Building2 size={20} className="text-secondary" />;
      case "MOBILE_MONEY": return <Smartphone size={20} className="text-secondary" />;
      case "CASH_PICKUP": return <MapPin size={20} className="text-secondary" />;
      default: return <Building2 size={20} className="text-text-secondary" />;
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Recipients</h1>
            <p className="text-text-subtle text-xs mt-1">{beneficiaries.length} saved</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-primary-dim border border-primary-border rounded-lg px-4 py-2 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>

        {isLoading && beneficiaries.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : beneficiaries.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Users size={48} className="text-text-subtle" />
            <p className="text-text-secondary text-lg font-semibold">No recipients yet</p>
            <button onClick={() => setIsAddModalOpen(true)} className="text-primary text-base font-medium">
              + Add your first recipient
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {beneficiaries.map((b) => (
              <div key={b.id} className="flex items-center gap-4 bg-card rounded-lg border border-border p-4">
                <div className="w-[46px] h-[46px] rounded-full bg-secondary-dim flex items-center justify-center shrink-0">
                  <span className="text-secondary text-base font-bold">
                    {b.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-semibold">{b.fullName}</p>
                  <p className="text-text-secondary text-xs mt-0.5">{b.country} · {b.payoutMethod.replace("_", " ").toLowerCase()}</p>
                  {b.payoutMethod === "BANK" && b.bankName && (
                    <p className="text-text-subtle text-xs mt-0.5">{b.bankName}</p>
                  )}
                  {b.payoutMethod === "MOBILE_MONEY" && b.mobileProvider && (
                    <p className="text-text-subtle text-xs mt-0.5">{b.mobileProvider}</p>
                  )}
                  {b.payoutMethod === "CASH_PICKUP" && b.cashPickupLocation && (
                    <p className="text-text-subtle text-xs mt-0.5">{b.cashPickupLocation}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-2 bg-card-alt rounded-md">
                    {renderMethodIcon(b.payoutMethod)}
                  </div>
                  <button
                    onClick={() => deleteBeneficiary(b.id)}
                    className="p-1.5 text-danger hover:bg-danger-dim rounded-md transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="bg-app-page w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-text-primary text-xl font-bold">Add Recipient</h2>
              <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="text-text-secondary hover:text-text-primary">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-1.5">Full Name</label>
                <input
                  type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-card border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-subtle outline-none focus:border-primary"
                  placeholder="Maria Santos"
                />
              </div>

              {/* Country chips */}
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">Country</label>
                <div className="flex gap-2 flex-wrap">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCountry(c)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedCountry.code === c.code
                          ? "bg-primary-dim border-primary text-primary"
                          : "bg-card border-border text-text-secondary hover:border-text-subtle"
                      }`}
                    >
                      {c.code} · {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Method */}
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">Payout Method</label>
                <div className="flex gap-2">
                  {PAYOUT_METHODS.map((m) => {
                    const Icon = m.icon;
                    const isActive = payoutMethod === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setPayoutMethod(m.key)}
                        className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-md border transition-colors ${
                          isActive
                            ? "bg-primary-dim border-primary text-primary"
                            : "bg-card border-border text-text-secondary hover:border-text-subtle"
                        }`}
                      >
                        <Icon size={18} className={isActive ? "text-primary" : ""} />
                        <span className="text-[10px] text-center">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {payoutMethod === "BANK" && (
                <>
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-1.5">Bank Name</label>
                    <input type="text" required value={bankName} onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-card border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-subtle outline-none focus:border-primary"
                      placeholder="BDO Unibank" />
                  </div>
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-1.5">Account Number</label>
                    <input type="text" required value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-card border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-subtle outline-none focus:border-primary"
                      placeholder="1234567890" />
                  </div>
                </>
              )}
              {payoutMethod === "MOBILE_MONEY" && (
                <>
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-1.5">Provider</label>
                    <input type="text" required value={mobileProvider} onChange={(e) => setMobileProvider(e.target.value)}
                      className="w-full bg-card border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-subtle outline-none focus:border-primary"
                      placeholder="MTN Mobile Money" />
                  </div>
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-1.5">Phone Number</label>
                    <input type="text" required value={mobileWalletNumber} onChange={(e) => setMobileWalletNumber(e.target.value)}
                      className="w-full bg-card border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-subtle outline-none focus:border-primary"
                      placeholder="+233 XX XXX XXXX" />
                  </div>
                </>
              )}
              {payoutMethod === "CASH_PICKUP" && (
                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-1.5">Preferred Pickup Location</label>
                  <input type="text" required value={cashPickupLocation} onChange={(e) => setCashPickupLocation(e.target.value)}
                    className="w-full bg-card border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-subtle outline-none focus:border-primary"
                    placeholder="City / Agent Location" />
                </div>
              )}

              <GradientButton title="Save Recipient" onPress={() => {}} loading={isSubmitting} />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
