import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Laptop, Monitor, Globe, LogOut, Shield, Info, Clock, MapPin } from "lucide-react";

interface Session {
  id: string;
  device: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  icon: "phone" | "laptop" | "browser" | "android";
}

const MOCK_SESSIONS: Session[] = [
  { id: "s1", device: "iPhone 15 Pro", os: "iOS 17.4", location: "New York, US", ip: "192.168.1.101", lastActive: "Now", isCurrent: true, icon: "phone" },
  { id: "s2", device: "MacBook Pro", os: "macOS Sonoma", location: "New York, US", ip: "192.168.1.102", lastActive: "2 hours ago", isCurrent: false, icon: "laptop" },
  { id: "s3", device: "Chrome Browser", os: "Windows 11", location: "London, UK", ip: "78.112.45.23", lastActive: "3 days ago", isCurrent: false, icon: "browser" },
  { id: "s4", device: "Samsung Galaxy S24", os: "Android 14", location: "Lagos, NG", ip: "41.58.134.90", lastActive: "1 week ago", isCurrent: false, icon: "android" },
];

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  phone: Smartphone,
  laptop: Laptop,
  browser: Monitor,
  android: Globe,
};

export default function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [revoking, setRevoking] = useState<string | null>(null);

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  const revokeSession = async (id: string) => {
    setRevoking(id);
    await new Promise((r) => setTimeout(r, 600));
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setRevoking(null);
  };

  const revokeAll = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/settings")} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 hover:border-primary/30 transition-colors">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-text-primary text-2xl font-bold">Active Sessions</h1>
            <p className="text-text-secondary text-sm">Logged-in Devices</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6 flex items-center gap-4 relative">
          <div className="w-13 h-13 rounded-lg bg-[#0084FF]/20 flex items-center justify-center shrink-0">
            <Globe size={24} className="text-[#0084FF]" />
          </div>
          <div className="flex-1">
            <p className="text-text-primary text-base font-semibold">{sessions.length} Active Session{sessions.length !== 1 ? "s" : ""}</p>
            <p className="text-text-secondary text-sm mt-0.5">
              {otherSessions.length > 0
                ? `${otherSessions.length} other device${otherSessions.length !== 1 ? "s" : ""} logged in`
                : "Only this device is logged in"}
            </p>
          </div>
          {otherSessions.length > 0 && <div className="w-2.5 h-2.5 rounded-full bg-[#F5A623] absolute top-4 right-4" />}
        </div>

        {/* Current Session */}
        <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase mb-2 ml-1">Current Session</p>
        {currentSession && (
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary-dim flex items-center justify-center shrink-0">
              {(() => {
                const Icon = iconMap[currentSession.icon] || Smartphone;
                return <Icon size={22} className="text-primary" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-text-primary text-sm font-semibold">{currentSession.device}</p>
                <span className="px-2 py-0.5 rounded-full bg-primary-dim border border-primary-border text-primary text-[9px] font-semibold shrink-0">This device</span>
              </div>
              <p className="text-text-secondary text-xs mb-1">{currentSession.os}</p>
              <div className="flex items-center gap-1 text-text-subtle text-[10px]">
                <MapPin size={10} />
                <span>{currentSession.location}</span>
                <span>·</span>
                <span>{currentSession.ip}</span>
              </div>
            </div>
          </div>
        )}

        {/* Other Sessions */}
        {otherSessions.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-text-subtle text-[10px] font-semibold tracking-wider uppercase ml-1">Other Devices</p>
              <button onClick={revokeAll} className="px-2.5 py-1 rounded-full bg-danger-dim border border-danger/25 text-danger text-[10px] font-semibold hover:bg-danger/20 transition-colors">Sign Out All</button>
            </div>

            {otherSessions.map((s) => {
              const Icon = iconMap[s.icon] || Smartphone;
              return (
                <div key={s.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-card-alt flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-semibold">{s.device}</p>
                    <p className="text-text-secondary text-xs mb-1">{s.os}</p>
                    <div className="flex items-center gap-1 text-text-subtle text-[10px]">
                      <MapPin size={10} />
                      <span>{s.location}</span>
                      <span>·</span>
                      <Clock size={10} />
                      <span>{s.lastActive}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => revokeSession(s.id)}
                    disabled={revoking === s.id}
                    className="w-10 h-10 rounded-lg bg-danger-dim flex items-center justify-center hover:bg-danger/20 transition-colors shrink-0"
                  >
                    <LogOut size={16} className="text-danger" />
                  </button>
                </div>
              );
            })}
          </>
        )}

        {otherSessions.length === 0 && (
          <div className="flex flex-col items-center py-12 bg-card rounded-xl border border-border gap-3 mb-6">
            <Shield size={36} className="text-primary" />
            <p className="text-primary text-lg font-semibold">All Secure</p>
            <p className="text-text-secondary text-sm">No other active sessions found</p>
          </div>
        )}

        {/* Notice */}
        <div className="flex items-start gap-2 bg-[#0084FF]/10 rounded-lg p-4 border border-[#0084FF]/25">
          <Info size={16} className="text-[#0084FF] shrink-0 mt-0.5" />
          <p className="text-text-secondary text-xs leading-5">
            If you see an unrecognized session, revoke it immediately and change your password.
          </p>
        </div>
      </div>
    </div>
  );
}
