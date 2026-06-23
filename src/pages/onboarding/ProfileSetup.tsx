import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";
import {
  ArrowLeft, Camera, Trash2, User, Phone, Mail, Save
} from "lucide-react";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      updateUser({ ...user!, fullName, email });
      await new Promise(r => setTimeout(r, 600));
      navigate(-1);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Personal Information</h1>
            <p className="text-text-secondary text-sm">Manage your profile details</p>
          </div>
        </div>

        {/* Avatar Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-5">
          <div className="flex flex-col items-center py-8 px-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center text-white font-bold text-3xl overflow-hidden shadow-lg shadow-[#00D6A3]/20">
                {avatar ? (
                  <img src={avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"
                )}
              </div>
              {avatar && (
                <button
                  onClick={() => { setAvatar(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-danger flex items-center justify-center hover:opacity-80 transition-opacity shadow"
                >
                  <Trash2 size={13} className="text-white" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setAvatar(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:bg-card-alt hover:text-text-primary transition-colors"
            >
              <Camera size={14} />
              Change Photo
            </button>
          </div>
        </div>

        {/* Fields Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-5">
          <div className="divide-y divide-border">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary-dim shrink-0">
                <User size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Full Name</p>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-transparent text-text-primary text-sm font-semibold placeholder-text-subtle outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary-dim shrink-0">
                <Phone size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Phone Number</p>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  className="w-full bg-transparent text-text-primary text-sm font-semibold placeholder-text-subtle outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary-dim shrink-0">
                <Mail size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-subtle text-[10px] font-semibold uppercase tracking-wider mb-1">Email</p>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                  className="w-full bg-transparent text-text-primary text-sm font-semibold placeholder-text-subtle outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <Save size={18} />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}
