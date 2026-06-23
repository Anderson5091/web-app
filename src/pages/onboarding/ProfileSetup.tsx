import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      updateUser({ ...user!, fullName, email });
      await new Promise(r => setTimeout(r, 800));
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Personal Information</h1>
            <p className="text-text-secondary text-sm">Manage your profile details</p>
          </div>
        </div>

        <Card>
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00D6A3] to-[#0084FF] flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"
                )}
              </div>
              {avatar && (
                <button
                  onClick={() => { setAvatar(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-danger flex items-center justify-center hover:opacity-80 transition-opacity"
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

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <Input
              id="fullName"
              label="Full Name"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />

            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="mt-2"
            >
              Save Changes
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
